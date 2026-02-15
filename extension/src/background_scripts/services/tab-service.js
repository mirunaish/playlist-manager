import {
  MessageTypes,
  Pages,
  pick,
  stripSupportedUrl,
  SupportedSites,
} from "../../utils";
import {
  tabRepository,
  playlistRepository,
  trackRepository,
} from "../repository";
import { getBrowser, insertScript } from "../util";

/** make selected tab active and window focused */
async function switchToTab(id) {
  await tabRepository.makeTabActive(id);
}

async function sendMessage(tabId, message) {
  await getBrowser().tabs.sendMessage(tabId, message);
}

/** which page should show on this tab's tab? */
async function getTabType(tabId) {
  const tab = await tabRepository.getTabById(tabId);

  // is a playlist playing in this tab?
  const playlist = await playlistRepository.getPlaylistByTabId(tabId);
  if (playlist) return Pages.PLAYLIST;

  // is there a track with this url in the database?
  const url = stripSupportedUrl(tab.url);
  const track = await trackRepository.getTrackByUrl(url);
  if (track) return Pages.TRACKED;

  // idk what this is. untracked?
  return Pages.UNTRACKED;
}

/**
 * try to guess the title and artist of this track based on info in the tab.
 * will call insertGuessedInfo when done
 */
async function guessTrackInfo(tabId, requesterId) {
  try {
    // insert content script if not already inserted
    await insertScript(tabId, "get_title_and_artist.js");
    // content script will send a message and background script will call insertGuessedInfo
  } catch (e) {
    // script already inserted
  }

  // send it a message asking for the info...
  await sendMessage(tabId, {
    type: MessageTypes.REQUEST_TRACK_INFO,
    payload: { requesterId },
  });
}

/** whether this tab is a supported site or not */
async function tabIsSupported(tabId) {
  const tab = await tabRepository.getTabById(tabId);

  return Object.values(SupportedSites).some((site) =>
    tab.url.match(site.regex),
  );
}

/** get limited info about all tabs, for rendering tab bar */
async function getSupportedTabs() {
  // keys to get for each tab
  const keys = ["id", "title", "audible", "discarded", "muted", "index"];

  const allTabs = await tabRepository.getAllTabs();

  // get tab data for each tab
  let tabs = await Promise.all(
    allTabs.map(async (tab) => {
      // select keys from tab data
      const tabData = pick(tab, keys);
      let title = tabData.title;

      // add track data, if tracked
      // will put track title in tab
      const track = await trackRepository.getTrackByUrl(tab.url);
      // add track title to tab title
      if (track?.title) title = track.title;

      // add playlist data, if playlist
      const playlist = await playlistRepository.getPlaylistByTabId(tab.id);
      // add the playlist name to the title
      if (playlist?.title) title = `${playlist.title} - ${title}`;

      // filter out tabs that don't have a playlist or a track and aren't supported / audible
      const isSupportedSite = await tabIsSupported(tab.id);
      if (!playlist && !track && !isSupportedSite && !tab.audible) return null;

      return {
        title,
        tab: tabData,
        track,
        playlist,
      };
    }),
  );

  tabs = tabs.filter((t) => t !== null);

  return tabs;
}

/** get first audible tab that's also a playlist */
async function getFirstAudiblePlaylistTab() {
  const audibleTabs = await tabRepository.getAudibleTabs();

  // find the first one that has a playlist attached
  for (let tab of audibleTabs) {
    const playlist = await playlistRepository.getPlaylistByTabId(tab.id);
    if (playlist) return tab;
  }

  // if none found but there is only one playlist, return that tab even if not audible
  const playlists = await playlistRepository.getAllPlaylists();
  if (playlists.length === 1) {
    const tabId = playlists[0].tabId;
    return await tabRepository.getTabById(tabId);
  }

  // TODO otherwise get the playlist that was last played (?)

  return null;
}

/**
 * active tab in current window if it's supported / playlist / audible >
 * (TODO maybe return the first audible tab that's also a playlist if any?)
 * any other audible tab in this window >
 * active tab in other window if's supported / playlist / audible
 * null
 */
async function getMostImportantTabId() {
  const activeTab = await tabRepository.getActiveTab();

  if (activeTab) {
    // audible: return active tab
    if (activeTab.audible) return activeTab.id;

    // if supported: return the active tab
    const isSupported = await tabIsSupported(activeTab.id);
    if (isSupported) return activeTab.id;

    // if playlist: return the active tab
    const playlist = await playlistRepository.getPlaylistByTabId(activeTab.id);
    if (playlist) return activeTab.id;
  }

  // if a playlist is audible, return that
  const audiblePlaylistTab = await getFirstAudiblePlaylistTab();
  if (audiblePlaylistTab) return audiblePlaylistTab.id;

  // or just get all audible tabs and return the first one if any
  const audibleTab = (await tabRepository.getAudibleTabs())[0];
  if (audibleTab) return audibleTab.id;

  // TODO TODO TODO TODO TODO TODO

  return null;
}

/** search for a track on one of the supported sites in a new tab */
async function searchOtherSite(query, site) {
  const url = SupportedSites[site].getQuery(query);

  await tabRepository.createTab({ url, active: true });
}

export const tabService = {
  ...tabRepository,
  switchToTab,
  getTabType,
  guessTrackInfo,
  getSupportedTabs,
  getFirstAudiblePlaylistTab,
  getMostImportantTabId,
  searchOtherSite,
};
