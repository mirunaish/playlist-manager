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
    await getBrowser().runtime.sendMessage({
      type: MessageTypes.STATUS_UPDATE,
      message,
      statusType,
    });
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
  if (getPlaylistInfo(tabId)) return Pages.PLAYLIST;
  if ((await getTrackedInfo(tabId)) != null) return Pages.TRACKED;

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

/** get info about a tab playing a tracked track */
async function getTrackedInfo(tabId) {
  // get tab url
  const url = (await getTab(tabId)).url;

  const { ok, body } = await request("/tracks/url", { body: { url } });
  if (!ok) return null;
  return body;
}

/** get limited info about all tabs, for rendering tab bar */
async function getSupportedTabs() {
  let tabs = [];

  // put in id:object map to only keep one copy of each tab
  const allTabs = Object.values({
    ...buildRecord(
      await Promise.all(Object.keys(playlists).map((id) => getTab(id)))
    ), // playlist tabs, even if not supported or audible
    ...buildRecord(await getBrowser().tabs.query({ url: SUPPORTED_QUERY })), // supported site tabs
    ...buildRecord(await getBrowser().tabs.query({ audible: true })), // audible tabs
  });

  // keys to get for each tab
  const keys = ["id", "title", "audible", "discarded", "muted", "index"];

  // get tab data for each tab and push to array
  // this is a for and not a map because of awaits
  for (let tab of allTabs) {
    // select keys from tab data
    const tabData = pick(tab, keys);

    // add track data, if tracked
    // will put track title in tab
    const trackData = await getTrackedInfo(tab.id);

    // add playlist data, if playlist
    const playlistData = playlists[tab.id];

    // get color from quickplay (?) if applicable TODO
    // const theme = trackData
    //   ? (await getAllQuickplay())[trackData.quickplayId].theme
    //   : null;

    tabs.push({
      tab: tabData,
      track: trackData,
      playlist: playlistData,
    });
  }

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
 *   tracks: array of tracks,
 *   playingIndex: index of track playing (numbered from 0),
 *   filters: applied filters
 * }
 */
let playlists = {};

/** get all info about playlist */
function getPlaylistInfo(tabId) {
  return playlists[tabId];
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
  getBrowser().runtime.sendMessage({
    type: MessageTypes.TABS_UPDATE,
  });
  // tell popup to switch to new tab
  getBrowser().runtime.sendMessage({
    type: MessageTypes.SELECT_TAB,
    payload: tab.id,
  });

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
  popup(MessageTypes.PLAYLIST_UPDATE, tabId, index);
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
    return;
  }

  delete playlists[tabId];
  popup(MessageTypes.TABS_UPDATE);
}

// edit track info
async function edit(trackData) {
  // edit info about the song currently playing
  const response = await request("/edit", { method: "POST", body: trackData });
  // if (response.ok) {
  //   // may have created a new artist
  //   artistCacheValid = false;
  //   // change track data in playlist and playingTrack
  //   playlist[playingIndex] = response.body;
  //   playingTrack = response.body;
  // }
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
    await getBrowser().runtime.sendMessage({
      type: MessageTypes.TRACK_INFO_FORWARD,
      payload: info,
    });
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
  getAllTags: async () => {
    return {
      123: { id: 123, name: "my tag", color: "darkred" },
      234: { id: 234, name: "another tag", color: "darkblue" },
      4343: { id: 4343, name: "some tag", color: "brown" },
      1: { id: 1, name: "just a tag", color: "darkgreen" },

      3: { id: 3, name: "a tag", color: "yellow" },
      4: { id: 4, name: "some other tag", color: "cyan" },
      43: { id: 43, name: "random tag", color: "pink" },
      11: { id: 11, name: "this is a tag", color: "red" },

      6657: { id: 6657, name: "aaaaaa", color: "black" },
      78787: { id: 78787, name: "bbbbbb", color: "white" },
    };
  },
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
      sendResponse(
        FUNCTIONS[message.functionName](...(message.args ? message.args : []))
      );
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
    await stopPlaying();
    return;
  }

  // if tab was a supported tab, let popup know to update its tabs
  if ((await getSupportedTabs()).map((t) => t.tab.id).includes(tabId)) {
    popup(MessageTypes.TABS_UPDATE);
  }
});
