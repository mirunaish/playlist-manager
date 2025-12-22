import { createCollection } from "../../utils";

// TODO move to firefox local storage? or to dexie?

/**
 * all playlists playing.
 * tabId: {
 *   title: mix title,  // ???
 *   theme: id of color theme,
 *   filters: applied filters
 *   tracks: array of track ids,
 *   playingIndex: index of track playing (numbered from 0),
 * }
 */
export const Playlists = createCollection("tabId");
