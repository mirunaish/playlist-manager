import { MessageTypes } from "../../utils";
import { popup } from "../util";
import { playlistService } from "./playlist-service";
import { tabService } from "./tab-service";

// start playlist button was pressed
async function startPlaying(title, theme, filters = null, playlist = null) {
  const playlistData = {
    title,
    theme,
    filters, // TODO this was structuredClone(filters) for some reason
    tracks: playlist,
    playingIndex: null,
  };

  // if playlist not provided, get it from filters
  if (playlistData.tracks === null) {
    playlistData.tracks = (
      await playlistService.previewPlaylist(filters)
    ).playlist;
  } else {
    // if tracks were provided, keep only the ids
    playlistData.tracks = playlistData.tracks.map((t) => t.id);
  }

  // create new tab to play in
  const tab = await tabService.createTab({
    index: 999, // at end (only works if fewer than 999 open pinned tabs) TODO test this?
    pinned: true,
    active: false,
  });

  // save to playlists repository
  playlistService.createPlaylist(tab.id, playlistData);

  // send message to popup with updated tabs
  popup(MessageTypes.TABS_UPDATE);
  // tell popup to switch to new tab
  popup(MessageTypes.SELECT_TAB, { id: tab.id });

  // start playing first track
  playTrack(tab.id, 0);
}

/** ready to play, load and play track at current index */
async function playTrack(tabId, index) {
  const playlist = await playlistService.getPlaylist(tabId);
  const track = playlist.tracks[index];

  // navigate the playing tab to new url
  await tabService.changeTabUrl(tabId, track.url);

  // update currently playing
  await playlistService.editPlaylist(tabId, { playingIndex: index });

  // tell popup that playing index changed
  popup(MessageTypes.PLAYLIST_UPDATE, { tabId, index });
  // tell popup that tabs changed too
  popup(MessageTypes.TABS_UPDATE);
}

/**
 * increase index and load next song.
 * if last song, stop playing
 */
async function next(tabId) {
  const p = await playlistService.getPlaylist(tabId);
  if (p.playingIndex < p.length - 1) {
    playTrack(tabId, p.playingIndex + 1);
  } else {
    // ive reached the end of the playlist
    stopPlaying(tabId);
  }
}

/**
 * decrease index and load previous song.
 * if first song, restart it instead
 */
async function previous(tabId) {
  const p = await playlistService.getPlaylist(tabId);
  const index = p.playingIndex > 0 ? p.playingIndex - 1 : p.playingIndex;
  playTrack(tabId, index);
}

/**
 * stop button was pressed / last song ended / tab was closed.
 * close tab and delete playlist
 */
async function stopPlaying(tabId) {
  // close the tab
  await tabService.closeTab(tabId);

  // delete the playlist
  await playlistService.deletePlaylist(tabId);

  popup(MessageTypes.REMOVE_TAB, { id: tabId });
}

export const mediaService = {
  startPlaying,
  playTrack,
  next,
  previous,
  stopPlaying,
};
