import { pick } from "../../utils";
import { artistRepository, trackRepository } from "../repository";

// filter + sort tracks
export async function getPlaylist(filters) {
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
  let playlist = (await trackRepository.getTracks(query)).map((t) =>
    pick(t, ["id", "url"])
  );

  if (playlist.length === 0) {
    throw Error("Found no tracks matching these filters");
  }

  // sort
  // TODO add more sorts
  if (filters.sort === "shuffle") {
    // shuffle the playlist
    for (let i = 0; i < playlist.length - 1; i++) {
      // pick random track and move it to the front
      let j = Math.floor(Math.random() * (playlist.length - i)) + i;

      // swap
      [playlist[i], playlist[j]] = [playlist[j], playlist[i]];
    }
  }

  // get playlist stats
  // const stats = getPlaylistStats(playlist);
  // TODO

  return { playlist, stats: undefined };
}

// function getPlaylistStats(playlist) {
//   let stats = {};

//   return stats;
// }
