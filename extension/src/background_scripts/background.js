/* eslint-disable no-unused-vars */

import {
  MessageTypes,
  SERVER_URL,
  SUPPORTED_SITES,
  StatusTypes,
} from "../consts";

/** update status bar in popup with info (default), error, or success */
async function updateStatus(message, statusType) {
  await browser.runtime.sendMessage({
    type: MessageTypes.STATUS_UPDATE,
    message,
    statusType,
  });
}

/** make selected tab active and window focused */
async function switchToTab(id) {
  const window = (await browser.tabs.get(id)).windowId;
  // focus window and make tab active
  await browser.windows.update(window, { focused: true });
  await browser.tabs.update(id, { active: true });
}

/** insert a content script */
async function insertScript(tabId, scriptPath) {
  try {
    await browser.tabs.executeScript(tabId, {
      file: scriptPath,
    });
  } catch (e) {
    console.error(e);
    updateStatus("Failed to execute the content script.", StatusTypes.ERROR);
  }
}

/**
 * make a request to the server
 * options format: {method, body}
 */
async function request(path, options = {}) {
  try {
    if (!options.method) options.method = "GET";

    // if get, cannot use body. use query instead
    if (options.method === "GET" && options.body) {
      let reqQuery = "?";
      for (var key in options.body) {
        reqQuery += key + "=" + encodeURIComponent(options.body[key]) + "&";
      }
      reqQuery = reqQuery.slice(0, -1);
      path += reqQuery;
      delete options.body;
    }
    if (options.body) {
      options.body = JSON.stringify(options.body);
      options.headers = { "Content-Type": "application/json" };
    }

    const response = await fetch(SERVER_URL + path, options);
    return { ok: response.ok, body: await response.json() };
  } catch (e) {
    console.error(e);
    throw Error("could not connect to server");
  }
}

async function getSupportedTabs() {
  // keys to get for each tab
  const keys = ["id", "title", "audible", "discarded", "muted"];

  let tabs = {};

  function appendTabData(tab) {
    // select keys from tab data
    let tabData = {};
    keys.forEach((key) => {
      tabData += { [key]: tab[key] };
    });

    // add track data, if tracked
    const trackData = null;

    // add playlist data, if playlist
    const playlistData = playlists[tab.id];

    tabs[tab.id] = { tab: tabData, track: trackData, playlist: playlistData };
  }

  // add supported site tabs
  (await browser.tabs.query({ url: SUPPORTED_SITES })).forEach(appendTabData);
  // add audible tabs (or replace if key already exists)
  (await browser.tabs.query({ audible: true })).forEach(appendTabData);

  tabs.map((tab) => {
    return { tab: { id: tab.id, active: tab.active }, track: {} };
  });
}

/**
 * active tab in current window if it's supported >
 * audible tab >
 * null
 */
async function getMostImportantTabId() {
  const activeTab = (
    await browser.tabs.query({
      url: SUPPORTED_SITES,
      active: true,
      currentWindow: true,
    })
  )[0];
  if (activeTab) return activeTab.id;

  const audibleTab = (
    await browser.tabs.query({
      audible: true,
    })
  )[0];
  if (audibleTab) return audibleTab.id;

  return null;
}

// cache array of artists
const artistCache = {
  valid: false,
  zoneId: null,
  data: [],
};
async function getAllArtists(zoneId) {
  if (artistCache.valid && zoneId === artistCache.zoneId)
    return artistCache.data;

  artistCache.data = (await request("/artists", { body: { zoneId } })).body;
  artistCache.zoneId = zoneId;
  artistCache.valid = true;
  return artistCache.data;
}

/** get info about a tab playing an untracked track */
async function getUntrackedInfo(tabId) {
  // TODO

  // insert content script
  try {
    await browser.tabs.executeScript(tabId, {
      file: "./get_title_and_artist.js",
    });
  } catch (e) {
    console.error(e);
    updateStatus("failed to execute the content script.", StatusTypes.ERROR);
  }

  // listen for messages from content script

  return {
    title: "test " + tabId,
    author: "test",
  };
}

/**
 * all playlists playing.
 * tabid: {list: array of tracks, index: index of track playing,
 * currTrack: track object, filters: applied filters}
 */
const playlists = {};

function getPlaylistInfo(tabId) {
  return playlists[tabId];
}

/*

// start playlist button was pressed
async function startPlaying(filters) {
  activeFilters = structuredClone(filters);
  console.log(activeFilters);

  // get playlist from backend
  const response = await request("/playlist", { body: filters });
  if (!response.ok) {
    throw Error("no tracks matching filter found");
  }
  playlist = response.body;

  // create new tab to play in
  const tab = await browser.tabs.create({
    index: 999, // at end (only works if fewer than 999 open pinned tabs) TODO test this?
    pinned: true,
    active: false,
  });
  playingTabId = tab.id;

  // start playing first track
  isPlaying = true;
  playingIndex = 0;
  loadTrack();
}

// ready to play, load and play track at current index
async function loadTrack() {
  // get info about playing track from backend
  const id = playlist[playingIndex].id;
  playingTrack = (await request("/id", { body: { id } })).body;
  updatePopup(); // popup gets data from playingTrack, not actual tab. async function

  // navigate the playing tab to new url
  await browser.tabs.update(playingTabId, { url: playingTrack.url });
}

// increase index and load next song
function next() {
  if (playingIndex < playlist.length - 1) {
    playingIndex++;
    loadTrack();
  } else stopPlaying();
}

// decrease index and load previous song
function previous() {
  if (playingIndex > 0) playingIndex--;
  loadTrack();
}

// stop button was pressed / last song ended / tab was closed
async function stopPlaying() {
  isPlaying = false;

  // close the tab
  try {
    await browser.tabs.remove(playingTabId);
    updatePopup();
  } catch (e) {
    // tab was already closed
    return;
  }
}

// edit track info
async function edit(trackData) {
  // edit info about the song currently playing
  const response = await request("/edit", { method: "POST", body: trackData });
  if (response.ok) {
    // may have created a new artist
    artistCacheValid = false;
    // change track data in playlist and playingTrack
    playlist[playingIndex] = response.body;
    playingTrack = response.body;
  }
  return response.ok;
}

// add new track
async function add(trackData) {
  // make request to backend
  const response = await request("/add", { method: "POST", body: trackData });
  if (response.ok) artistCacheValid = false;
  return response.ok;
}

// a list row was clicked. play that track
async function changeTrack(index) {
  playingIndex = index;
  loadTrack();
}

// receive messages from content script
// content script also catches next and previous hardware key presses
browser.runtime.onMessage.addListener((message) => {
  // if message is previous or next
  if (message.type === "media-control") {
    if (message.action === "next") {
      next();
    } else if (message.action === "previous") {
      previous();
    }
  } else if (message.type === "info-retrieved") {
    insertGuessedInfo(message.payload);
  } else {
    console.log("background received unknown message");
    console.log(message);
  }
});

// add event listener that injects content script after the page loads
browser.tabs.onUpdated.addListener(
  async (tabId, changeInfo, tabInfo) => {
    if (
      siteSupported(tabInfo.url) &&
      tabId === playingTabId &&
      changeInfo.status === "complete"
    ) {
      try {
        // content script won't run if it already has
        // if page is refreshed content script will run again
        await browser.tabs.executeScript(playingTabId, {
          file: "./insert_listener.js",
        });
      } catch (e) {
        console.error(e);
        updateStatus("failed to execute the content script.", { error: true });
      }
    }
  },
  {
    urls: supportedSites,
    properties: ["status"],
  }
);

// add event listener that refreshes popup if tabs change
// TODO

// add event listener that stops playing if tab is closed
browser.tabs.onRemoved.addListener(async (tabId) => {
  if (isPlaying && tabId === playingTabId) {
    await stopPlaying();
  }
});

*/

browser.runtime.onMessage.addListener((message) => {
  if (message.type === MessageTypes.STATUS_UPDATE) {
    // forward status updates from components to status component
    browser.runtime.sendMessage(message);
  }
});
