export const SERVER_URL = "http://localhost:5000";

export const SUPPORTED_SITES = [
  "*://www.youtube.com/*",
  "*://soundcloud.com/*",
];
export const SUPPORTED_REGEX = [
  /.*:\/\/www\.youtube\.com\/watch.*/,
  /.*:\/\/soundcloud\.com\/.*\/.*/,
];

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
