/** cannot make these consts because i get weird errors */

export let SERVER_URL = "http://localhost:5000";

export let SupportedSites = {
  youtube: {
    query: "*://www.youtube.com/*",
    regex: /.*:\/\/www\.youtube\.com\/watch.*/,
    getQuery: (query) =>
      "https://www.youtube.com/results?search_query=" +
      encodeURIComponent(query).replaceAll("%20", "+"),
  },
  soundcloud: {
    query: "*://soundcloud.com/*",
    regex: /.*:\/\/soundcloud\.com\/.*\/.*/,
    getQuery: (query) => "https://soundcloud.com/", // TODO
  },
};

export let SUPPORTED_QUERY = Object.values(SupportedSites).map(
  (obj) => obj.query
);

export let Pages = {
  QUICKPLAY: "QUICKPLAY",
  NEW_MIX: "NEW_MIX",
  SEARCH: "SEARCH",
  SETTINGS: "SETTINGS",

  UNTRACKED: "UNTRACKED",
  TRACKED: "TRACKED",
  PLAYLIST: "PLAYLIST",
};

export let MessageTypes = {
  FUNCTION_CALL: "function-call",

  STATUS_UPDATE: "status-update",
  PLAYLIST_UPDATE: "playlist-update", // currently playing track changed
  TABS_UPDATE: "tabs-update", // a tab was added / removed or its title changed

  SELECT_TAB: "", // you should select this tab

  TRACK_INFO: "track-info",
  TRACK_INFO_FORWARD: "track-info-forward",
  MEDIA_CONTROL: "media-control",
};

export let StatusTypes = {
  INFO: "info",
  ERROR: "error",
  SUCCESS: "success",
};

export let BORDER_STYLE = "1px solid var(--ui)";
