import { Playlists } from "../models";

async function getPlaylistByTabId(tabId) {
  const playlist = await Playlists.findById(tabId);
  return playlist.data;
}

export const playlistRepository = {
  getPlaylistByTabId,
};
