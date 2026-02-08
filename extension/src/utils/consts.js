export const SERVER_URL = "http://localhost:5000";

export const SupportedSites = {
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
    getQuery: (query) => "https://soundcloud.com/search?q=" + query,
  },
};

export const Pages = {
  DEFAULT: "NEW_MIX",

  QUICKPLAY: "QUICKPLAY",
  NEW_MIX: "NEW_MIX",
  SEARCH: "SEARCH",
  SETTINGS: "SETTINGS",

  UNTRACKED: "UNTRACKED",
  TRACKED: "TRACKED",
  PLAYLIST: "PLAYLIST",
};

export const MessageTypes = {
  FUNCTION_CALL: "function-call",

  STATUS_UPDATE: "status-update",
  PLAYLIST_UPDATE: "playlist-update", // currently playing track changed
  TABS_UPDATE: "tabs-update", // a tab was added or its title changed
  REMOVE_TAB: "remove-tab", // a tab was closed

  SELECT_TAB: "select-tab", // you should select this tab

  REQUEST_TRACK_INFO: "request-track-info",
  TRACK_INFO: "track-info",
  TRACK_INFO_FORWARD: "track-info-forward",
  MEDIA_CONTROL: "media-control",
};

export const Listeners = {
  TAB_DELETE: "tab-delete",
};

export const StatusTypes = {
  INFO: "info",
  ERROR: "error",
  SUCCESS: "success",
};

export const EMPTY_TRACK = {
  id: "",
  title: "",
  artists: [],
  imageLink: "",
  url: "",
  duration: 0,

  tags: [],
  rating: 0,
};
export const EMPTY_PLAYLIST = {
  title: "Playlist",
  theme: "PINK_CHAMPAGNE",

  tracks: [],
  filters: {},
};

export const BORDER_STYLE = "1px solid var(--ui)";

export const GRADIENT = {
  gradientQuality: 5, // quality of gradient on star (will need higher quality for bigger angle)
  animationQuality: 10, // quality of color transitions in gradient (should always be high-ish)
  rainbowDegrees: 180, // how many degrees of rainbow to show in a star, out of 360
};
