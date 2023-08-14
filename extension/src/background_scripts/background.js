/* eslint-disable no-unused-vars */

import { SERVER_URL } from "../consts";

console.log("background page works");

// make a request to the server
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
    console.log(e);
    throw "could not connect to server";
  }
}

// to be set by popup
let updatePopup = () => {};
let announceError = (message, type) => {};
let insertGuessedInfo = (payload) => {};
function setFunctions(update, error, insert) {
  updatePopup = () => {
    try {
      update();
    } catch (e) {}
  };
  announceError = (message, type) => {
    try {
      error(message, type);
    } catch (e) {}
  };
  insertGuessedInfo = (payload) => {
    try {
      insert(payload);
    } catch (e) {}
  };
}

// info about track playing
let isPlaying = false; // are we currently playing a playlist
let playingTabId = null; // tab that playlist is playing in, if playing a playlist
let playlist = [];
let playingIndex = null; // the track currently playing, as an index into playlist
let playingTrack = null; // the track currently playing, as an object
let activeFilters = null; // filters

function getPlayingInfo() {
  return {
    isPlaying,
    playingTabId,
    playlist,
    playingIndex,
    playingTrack,
    activeFilters,
  };
}

const supportedSites = ["*://www.youtube.com/*", "*://soundcloud.com/*"];
const supportedRegex = [
  /.*:\/\/www\.youtube\.com\/watch.*/,
  /.*:\/\/soundcloud\.com\/.*\/.*/,
];

// given url, determine whether it is a supported site
function siteSupported(url) {
  // the page is a new tab
  if (!url) return false;

  let result = false;
  supportedRegex.forEach((site) => {
    result = url.match(site) ? true : result;
  });

  return result;
}

async function getActiveTab() {
  return (await browser.tabs.query({ active: true, currentWindow: true }))[0];
}

// cache array of artists
let artistCache = [];
let artistCacheValid = false;
async function getAllArtists() {
  if (artistCacheValid) return artistCache;

  artistCache = (await request("/artists")).body;
  artistCacheValid = true;
  return artistCache;
}

// start playlist button was pressed
async function startPlaying(filters) {
  activeFilters = structuredClone(filters);
  console.log(activeFilters);

  // get playlist from backend
  const response = await request("/playlist", { body: filters });
  if (!response.ok) {
    throw "no tracks matching filter found";
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
          file: "/content_scripts/insert_listener.js",
        });
      } catch (e) {
        console.log(e);
        announceError("failed to execute the content script.", "error");
      }
    }
  },
  {
    urls: supportedSites,
    properties: ["status"],
  }
);

// add event listener that stops playing if tab is closed
browser.tabs.onRemoved.addListener(async (tabId) => {
  if (isPlaying && tabId === playingTabId) {
    await stopPlaying();
  }
});
