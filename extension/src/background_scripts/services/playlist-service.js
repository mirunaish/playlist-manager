import { SORTS } from "../../utils";
import {
  artistRepository,
  trackRepository,
  playlistRepository,
} from "../repository";
import { trackService } from "./track-service";

/** shuffle tracks in playlist */
function reshuffle(playlist, startIndex = 0) {
  for (let i = startIndex; i < playlist.length - 1; i++) {
    // pick random track
    let j = Math.floor(Math.random() * (playlist.length - i)) + i;
    // move it to the front (j can be =i in which case i doesn't move)
    [playlist[i], playlist[j]] = [playlist[j], playlist[i]];
  }
  return playlist;
}

/** remove all tracks after this index. exclusive */
async function removeTracksAfterIndex(tabId, endIndex) {
  const playlist = await playlistRepository.getPlaylistByTabId(tabId);
  const newTracks = [...playlist.tracks.slice(0, endIndex)];
  const editedPlaylist = await playlistRepository.editPlaylist(tabId, {
    tracks: newTracks,
  });
  return editedPlaylist;
}

// function getPlaylistStats(playlist) {
//   let stats = {};

//   return stats;
// }

// filter + sort tracks
async function previewPlaylist(filters) {
  const query = {
    artists: filters.artists?.length > 0 ? filters.artists : undefined,
    rating: filters.rating?.length > 0 ? filters.rating : undefined,
    tags: {
      value:
        filters.includedTags?.length > 0 ? filters.includedTags : undefined,
      exclude:
        filters.excludedTags?.length > 0 ? filters.excludedTags : undefined,
    },
  };

  // if i am given starred, i have to do a join and then filter by artist ids.
  // unless i am also given an artist filter, in which case just do that
  if (query.artists === undefined && filters.starred !== undefined) {
    // find all starred/unstarred artists
    const filterArtistIds = (
      await artistRepository.getArtists({ starred: filters.starred })
    ).map((a) => a.id);

    query.artists = filterArtistIds;
  }

  // get playlist with filters
  let tracks = await trackRepository.getTracks(query);

  if (tracks.length === 0) {
    throw Error("Found no tracks matching these filters");
  }

  // sort
  if (filters.sort === SORTS.shuffle) {
    // shuffle the playlist
    tracks = reshuffle(tracks);
  } else {
    const [sortKey, sortDirection] = filters.sort.split(":");
    tracks = trackService.sortTracks(tracks, sortKey, sortDirection);
  }

  return tracks;
}

/**
 * get all info about playlist.
 * also include all track data for each track in the playlist
 */
async function getPlaylistByTabId(tabId) {
  const playlist = await playlistRepository.getPlaylistByTabId(tabId);
  if (!playlist) return null;

  // attach track info to playlist
  playlist.tracks = await Promise.all(
    playlist.tracks.map((id) => trackRepository.getTrackById(id)),
  );

  return playlist;
}

export const playlistService = {
  ...playlistRepository,
  getPlaylistByTabId, // overwrite the method from repository
  reshuffle,
  previewPlaylist,
  removeTracksAfterIndex,
};
