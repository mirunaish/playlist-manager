export const SERVER_URL = "http://localhost:5000";

export const SUPPORTED_SITES = [
  "*://www.youtube.com/*",
  "*://soundcloud.com/*",
];
export const SUPPORTED_REGEX = [
  /.*:\/\/www\.youtube\.com\/watch.*/,
  /.*:\/\/soundcloud\.com\/.*\/.*/,
];

export const MessageTypes = {
  STATUS_UPDATE: "status-update",
  TRACK_INFO: "track-info",
  MEDIA_CONTROL: "media-control",
};

export const StatusTypes = {
  ERROR: "error",
  SUCCESS: "success",
};

export const UNTRACKED_ZONE = {
  name: "Untracked",
  id: "0",
};
