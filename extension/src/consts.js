export var SERVER_URL = "http://localhost:5000";

export var SupportedSites = {
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

export var SUPPORTED_QUERY = Object.values(SupportedSites).map(
  (obj) => obj.query
);

export var Pages = {
  QUICKPLAY: "QUICKPLAY",
  NEW_MIX: "NEW_MIX",
  SEARCH: "SEARCH",
  SETTINGS: "SETTINGS",

  UNTRACKED: "UNTRACKED",
  TRACKED: "TRACKED",
  PLAYLIST: "PLAYLIST",
};

export var MessageTypes = {
  FUNCTION_CALL: "function-call",

  STATUS_UPDATE: "status-update",
  TRACK_INFO: "track-info",
  TRACK_INFO_FORWARD: "track-info-forward",
  MEDIA_CONTROL: "media-control",
};

export var StatusTypes = {
  ERROR: "error",
  SUCCESS: "success",
};
