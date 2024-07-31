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
    getQuery: (query) => "https://soundcloud.com/", // TODO
  },
};

export const SUPPORTED_QUERY = Object.values(SupportedSites).map(
  (obj) => obj.query
);

export const Pages = {
  NEW_TAB: "NEW_TAB",
  SETTINGS: "SETTINGS",

  UNTRACKED: "UNTRACKED",
  TRACKED: "TRACKED",
  PLAYLIST: "PLAYLIST",
};

export const MessageTypes = {
  STATUS_UPDATE: "status-update",
  TRACK_INFO: "track-info",
  TRACK_INFO_FORWARD: "track-info-forward",
  MEDIA_CONTROL: "media-control",
};

export const StatusTypes = {
  ERROR: "error",
  SUCCESS: "success",
};
