import { Playlists } from "../models";

async function getAllPlaylists() {
  const playlists = await Playlists.findAll();
  return playlists.map((p) => ({ ...p.data }));
}

async function getPlaylistByTabId(tabId) {
  const playlist = await Playlists.findById(tabId);
  return playlist ? { ...playlist.data } : null;
}

async function createPlaylist(tabId, playlistData) {
  const playlist = new Playlists({
    ...playlistData,
    tabId,
  });

  await playlist.save();

  return { ...playlist.data };
}

async function editPlaylist(tabId, newData) {
  const playlist = await Playlists.findById(tabId);
  if (!playlist) throw new Error("no playlist with tabId " + tabId);

  playlist.set(newData);
  await playlist.save();
  return { ...playlist.data };
}

async function deletePlaylist(tabId) {
  const playlist = await Playlists.findById(tabId);
  await playlist.remove();
}

export const playlistRepository = {
  getAllPlaylists,
  getPlaylistByTabId,
  createPlaylist,
  editPlaylist,
  deletePlaylist,
};
