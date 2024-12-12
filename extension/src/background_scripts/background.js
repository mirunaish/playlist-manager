/* eslint-disable no-unused-vars */

import {
  MessageTypes,
  Pages,
  StatusTypes,
  SUPPORTED_QUERY,
  SupportedSites,
} from "../consts";
import { getBrowser, getTab, popup, insertScript, request } from "./util";
import { pick, buildRecord } from "../util";

/** update status bar in popup with info (default), error, or success */
async function updateStatus(message, statusType) {
  try {
    await popup(MessageTypes.STATUS_UPDATE, { message, statusType });
  } catch (e) {
    console.error('failed to update status "' + message + '";', e);
  }
}

/** make selected tab active and window focused */
async function switchToTab(id) {
  const window = (await getTab(id)).windowId;
  // focus window and make tab active
  await getBrowser().windows.update(window, { focused: true });
  await getBrowser().tabs.update(id, { active: true });
}

/** which page should show on this tab's tab? */
async function getTabType(tabId) {
  if (playlists[tabId]) return Pages.PLAYLIST;
  if ((await getTrackedInfo({ tabId })) != null) return Pages.TRACKED;

  return Pages.UNTRACKED;
}

/** get info about a tab playing an untracked track */
async function getUntrackedInfo(tabId) {
  try {
    // insert content script
    await insertScript(tabId, "get_title_and_artist.js");
    // will listen for messages from content script and call insertGuessedInfo
  } catch (e) {
    console.error("could not get track info:", e);
    updateStatus("could not get track info.", StatusTypes.ERROR);
  }
}

const trackedCache = {}; // { url: { trackedInfo: Track | null, valid: bool } }

/** get info about a tab playing a tracked track */
async function getTrackedInfo({ tabId = null, url = null }) {
  // get tab url if not given
  if (tabId && !url) url = (await getTab(tabId)).url;

  if (trackedCache[url]?.valid) return trackedCache[url].trackedInfo;

  const { ok, body } = await request("/tracks/url", { body: { url } });

  trackedCache[url] = {
    trackedInfo: ok ? body : null,
    valid: true,
  };

  return trackedCache[url].trackedInfo;
}

/** get limited info about all tabs, for rendering tab bar */
async function getSupportedTabs() {
  // get all tabs
  const allTabs = await getBrowser().tabs.query({});

  // filter tabs (can't use allTabs.filter because of await)
  const supportedTabs = [];
  for (let tab of allTabs) {
    // keep supported
    if (Object.values(SupportedSites).some((site) => tab.url.match(site.regex)))
      supportedTabs.push(tab);
    // keep playlist
    else if (playlists[tab.id]) supportedTabs.push(tab);
    // keep audible
    else if (tab.audible) supportedTabs.push(tab);
    // keep tracked
    else if (await getTrackedInfo({ tabId: tab.id })) supportedTabs.push(tab);
  }

  // keys to get for each tab
  const keys = ["id", "title", "audible", "discarded", "muted", "index"];

  // get tab data for each tab
  let tabs = await Promise.all(
    supportedTabs.map(async (tab) => {
      // select keys from tab data
      const tabData = pick(tab, keys);

      // add track data, if tracked
      // will put track title in tab
      const trackData = await getTrackedInfo({ tabId: tab.id });

      // add playlist data, if playlist
      const playlistData = await getPlaylistInfo(tab.id);
      if (playlistData?.title)
        tabData.title = `${playlistData.title} - ${playlistData.tracks[playlistData.playingIndex].title}`;

      return {
        tab: tabData,
        track: trackData,
        playlist: playlistData,
      };
    })
  );

  // sort tabs by index
  tabs.sort((a, b) => a.tab.index - b.tab.index);

  return tabs;
}

async function getAudibleTabs() {
  return await getBrowser().tabs.query({
    audible: true,
  });
}

/**
 * active tab in current window if it's supported >
 * audible tab >
 * null
 */
async function getMostImportantTabId() {
  const activeTab = (
    await getBrowser().tabs.query({
      url: SUPPORTED_QUERY,
      active: true,
      currentWindow: true,
    })
  )[0];
  if (activeTab) return activeTab.id;
  // TODO return active tab if playlist but not supported

  const audibleTab = (await getAudibleTabs())[0];
  if (audibleTab) return audibleTab.id;

  return null;
}

// cache array of artists
const artistCache = {
  valid: false,
  data: {},
};
async function getAllArtists() {
  if (artistCache.valid) return artistCache.data;

  const artists = (await request("/artists")).body;
  artistCache.data = buildRecord(artists);
  artistCache.valid = true;
  return artistCache.data;
}

const tagCache = {
  valid: false,
  data: {},
};
async function getAllTags() {
  if (tagCache.valid) return tagCache.data;

  const tags = (await request("/tags")).body;
  tagCache.data = buildRecord(tags);
  tagCache.valid = true;
  return tagCache.data;
}

/** ask backend for a playlist */
async function getPlaylist(filters) {
  // get playlist from backend
  const response = await request("/playlist", {
    method: "POST",
    body: filters,
  });

  // if no tracks found, throw error message
  if (!response.ok) {
    throw Error("No tracks matching filter found");
  }

  return response.body; // { playlist, stats }
}

// TODO move to firefox local storage?
/**
 * all playlists playing.
 * tabid: {
 *   title: mix title,
 *   theme: id of color theme,
 *   filters: applied filters
 *   tracks: array of tracks { id, url },
 *   playingIndex: index of track playing (numbered from 0),
 * }
 */
let playlists = {};

/** get all info about playlist */
async function getPlaylistInfo(tabId) {
  const playlistInfo = playlists[tabId];
  if (!playlistInfo) return null;
  return {
    ...playlistInfo,
    tracks: await Promise.all(
      playlistInfo.tracks.map(({ url }) => getTrackedInfo({ url }))
    ),
  };
}

// start playlist button was pressed
async function startPlaying(title, theme, filters = null, playlist = null) {
  // TODO this was structuredClone(filters) for some reason
  const playlistData = {
    title,
    theme,
    filters,
    tracks: playlist,
    playingIndex: null,
  };

  // if playlist not provided, get it from backend
  if (playlistData.tracks === null) {
    // @ts-ignore
    playlistData.tracks = (await getPlaylist()).playlist;
  }

  // create new tab to play in
  const tab = await getBrowser().tabs.create({
    index: 999, // at end (only works if fewer than 999 open pinned tabs) TODO test this?
    pinned: true,
    active: false,
  });

  // save to playlists object
  playlists[tab.id] = playlistData;

  // send message to popup with updated tabs
  popup(MessageTypes.TABS_UPDATE);
  // tell popup to switch to new tab
  popup(MessageTypes.SELECT_TAB, { id: tab.id });

  // start playing first track
  playTrack(tab.id, 0);
}

/** ready to play, load and play track at current index */
async function playTrack(tabId, index) {
  const track = playlists[tabId].tracks[index];

  // navigate the playing tab to new url
  await getBrowser().tabs.update(tabId, { url: track.url });

  // update currently playing
  playlists[tabId].playingIndex = index;

  // tell popup that playing index changed
  popup(MessageTypes.PLAYLIST_UPDATE, { tabId, index });
}

/**
 * increase index and load next song.
 * if last song, stop playing
 */
function next(tabId) {
  const p = playlists[tabId];
  if (p.playingIndex < p.length - 1) {
    playTrack(tabId, p.playingIndex + 1);
  } else stopPlaying(tabId);
}

/**
 * decrease index and load previous song.
 * if first song, restart it instead
 */
function previous(tabId) {
  const p = playlists[tabId];
  const index = p.playingIndex > 0 ? p.playingIndex - 1 : p.playingIndex;
  playTrack(tabId, index);
}

// stop button was pressed / last song ended / tab was closed
/** close tab and delete playlist */
async function stopPlaying(tabId) {
  try {
    // close the tab
    await getBrowser().tabs.remove(tabId);
  } catch (e) {
    // tab was already closed
    // do nothing
  }

  delete playlists[tabId];

  popup(MessageTypes.REMOVE_TAB, { id: tabId });
}

// edit track info
async function edit(oldUrl, trackData, tabId = null) {
  // edit info about the song currently playing
  const response = await request("/edit", { method: "POST", body: trackData });
  if (response.ok) {
    // may have created a new artist
    artistCache.valid = false;
    // may have created new tags
    tagCache.valid = false;
    // need to update trackinfo cache too, both old and new urls
    trackedCache[trackData.url].valid = false;
    trackedCache[oldUrl].valid = false;

    // if url changed, change it in playlists
    if (trackData.url !== oldUrl) {
      for (const playlist of Object.values(playlists)) {
        for (const track of playlist.tracks) {
          if (track.id === trackData.id) {
            track.url = trackData.url;
          }
        }
      }
    }

    // if tabId was given, switch to new url
    if (tabId) {
      await getBrowser().tabs.update(tabId, { url: trackData.url });
    }

    // tell popup to update tabs (title and/or artist may have changed)
    popup(MessageTypes.TABS_UPDATE);
  }
  return response.ok;
}

// add new track
async function add(trackData) {
  // make request to backend
  const response = await request("/tracks", {
    method: "POST",
    body: trackData,
  });
  if (response.ok) {
    artistCache.valid = false;
    tagCache.valid = false;
    trackedCache[trackData.url].valid = false; // will replace null with new data
    updateStatus("track added successfully", StatusTypes.SUCCESS);
  } else updateStatus("failed to add track", StatusTypes.ERROR);
}

/** search for a track on one of the supported sites in a new tab */
async function searchOtherSite(query, site) {
  const url = SupportedSites[site].getQuery(query);
  await getBrowser().tabs.create({
    url,
    active: true,
  });
}

// content script listener calls this function to send untracked data
/** send message with untracked info to the popup */
async function insertGuessedInfo(info) {
  try {
    await popup(MessageTypes.TRACK_INFO_FORWARD, info);
  } catch (e) {
    console.error('failed to insert info "' + JSON.stringify(info) + '";', e);
  }
}

/**
 * background functions that can be called from popup.
 * unfortunately i need this object because async functions cannot be accessed
 * using other methods such as window[functionName] as far as i can tell
 */
export const FUNCTIONS = {
  getSupportedTabs,
  getMostImportantTabId,
  getTabType,
  switchToTab,
  getAllArtists,
  getAllTags,
  getPlaylist,
  startPlaying,
  playTrack,
  next,
  previous,
  stopPlaying,
  getPlaylistInfo,
  getTrackedInfo,
  getUntrackedInfo,
  add,
  edit,
  searchOtherSite,
};

// receive messages from content script and popup
getBrowser().runtime.onMessage.addListener((message, sender, sendResponse) => {
  // if popup components want to update the status they send a message to the
  // background script which then forwards it to the status component
  if (message.type === MessageTypes.STATUS_UPDATE) {
    getBrowser().runtime.sendMessage(message);
  }

  // content script catches next and previous hardware key presses
  else if (message.type === MessageTypes.MEDIA_CONTROL) {
    // will call next() or previous() on first audible tab that's a playlist
    // (if any)
    getAudibleTabs().then((result) => {
      const affectedTab = result.filter((tab) => playlists[tab.id] !== null)[0];
      if (!affectedTab) {
        // if popup is visible, let user know
        updateStatus("No playing playlist found.", StatusTypes.ERROR);
        return;
      }

      if (message.action === "next") {
        next(affectedTab.id);
      } else if (message.action === "previous") {
        // if player is in first 10 seconds,
        // tab will restart track instead of sending "previous" message
        previous(affectedTab.id);
      }
    });
  }

  // content script sent track info
  else if (message.type === MessageTypes.TRACK_INFO) {
    // forward to popup
    insertGuessedInfo(message.payload);
  }

  // popup is asking background script to run a function
  else if (message.type === MessageTypes.FUNCTION_CALL) {
    try {
      // call function and return its result
      sendResponse(FUNCTIONS[message.functionName](...(message.args ?? [])));
    } catch (e) {
      console.error(
        "failed to run function %s: %s",
        message.functionName,
        e.message
      );
    }
  }

  // default case
  else {
    console.warn("background received unknown message", message);
  }
});

// add event listener that injects content script after the page loads
// TODO inject listener and send track info if inactive tab becomes active
// browser.tabs.onUpdated.addListener(
//   async (tabId, changeInfo, tabInfo) => {
//     if (
//       siteSupported(tabInfo.url) &&
//       tabId === playingTabId &&
//       changeInfo.status === "complete"
//     ) {
//       try {
//         // content script won't run if it already has
//         // if page is refreshed content script will run again
//         await browser.tabs.executeScript(playingTabId, {
//           file: "./insert_listener.js",
//         });
//       } catch (e) {
//         console.error(e);
//         updateStatus("failed to execute the content script.", { error: true });
//       }
//     }
//   },
//   {
//     urls: supportedSites,
//     properties: ["status"],
//   }
// );

// add event listener that refreshes popup if tabs change
// TODO

// add event listener that stops playing if tab is closed
getBrowser().tabs.onRemoved.addListener(async (tabId) => {
  if (playlists[tabId]) {
    await stopPlaying(tabId);
    return; // stopPlaying tells popup to remove tab
  }

  // let popup know to remove this tabs
  // even though popup is likely closed if tab wasn't playlist
  popup(MessageTypes.REMOVE_TAB, { id: tabId });
});
