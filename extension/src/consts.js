import { Icons } from "./views/popup/icons";

export const SERVER_URL = "http://localhost:5000";

export const SupportedSites = {
  youtube: {
    query: "*://www.youtube.com/*",
    regex: /.*:\/\/www\.youtube\.com\/watch.*/,

    icon: Icons.YOUTUBE,
  },
  soundcloud: {
    query: "*://soundcloud.com/*",
    regex: /.*:\/\/soundcloud\.com\/.*\/.*/,

    icon: Icons.SOUNDCLOUD,
  },
  spotify: {},
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
