import { Listeners, MessageTypes, SupportedSites } from "../utils/consts";
import { getBrowser, insertScript, updateStatus } from "./util";
import { dexie } from "./database/dexie";
import {
  tabRouter,
  artistRouter,
  playlistRouter,
  tagRouter,
  trackRouter,
  mediaRouter,
  backupRouter,
} from "./routers";
import { FUNCTIONS } from "../utils";

// open dexie database
dexie
  .open()
  .then(() => console.log("connected to dexie"))
  .catch((e) => console.error("failed to open indexed db:", e));

// some keys are MessageTypes, others are FUNCTIONS...
const allRoutes = {
  ...artistRouter,
  ...playlistRouter,
  ...tabRouter,
  ...tagRouter,
  ...trackRouter,
  ...mediaRouter,
  ...backupRouter,
};

// receive messages from content script and popup
getBrowser().runtime.onMessage.addListener((message, sender, sendResponse) => {
  // popup is asking background script to run a function
  if (message.type === MessageTypes.FUNCTION_CALL) {
    try {
      // call function and return its result
      // this works even if the called function is async
      // don't await it or it'll break! this callback function has to stay synchronous
      // i think it returns a promise that the popup awaits? maybe
      sendResponse(allRoutes[message.functionName](...(message.args ?? [])));
    } catch (e) {
      // because i don't await, this won't actually catch errors thrown by async functions
      // the error will be propagated directly to the popup when the promise is rejected
      // (i think??)
      console.error(
        "failed to run function %s: %s",
        message.functionName,
        e.message,
      );
    }
  } else {
    // otherwise, the message handler should be defined in allRoutes
    const handler = allRoutes[message.type];
    if (!handler) {
      console.warn("background received unknown message", message);
      return;
    }

    handler(message);
  }
});

// add event listener that injects content script into playlist tabs after the page loads
// it only inserts into supported sites, even though playlists can contain non-supported
// but the script is site-specific so it won't work for non-supported sites anyway
// TODO inject listener and send track info if inactive tab becomes active
getBrowser().tabs.onUpdated.addListener(
  async (tabId, changeInfo, tabInfo) => {
    if (changeInfo.status !== "complete") return;

    // check if this tab is a playlist
    const playlist = await playlistRouter[FUNCTIONS.getPlaylistByTabId](tabId);

    if (playlist) {
      try {
        // content script won't run if it already has
        // if page is refreshed content script will run again
        await insertScript(tabId, "insert_listener.js");
      } catch (e) {
        console.error(e);
        updateStatus("failed to execute the content script.", { error: true });
      }
    }
  },
  {
    urls: Object.values(SupportedSites).map((site) => site.query),
    properties: ["status"],
  },
);

// add event listener that refreshes popup if tabs change
// TODO

// add event listener that stops a playlist if user closes tab
getBrowser().tabs.onRemoved.addListener(async (tabId) => {
  const handler = allRoutes[Listeners.TAB_DELETE];
  if (!handler) return;

  await handler(tabId);
});
