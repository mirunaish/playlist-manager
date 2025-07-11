import { db } from "./database";
import { pick } from "../../util.js";

// filter + sort tracks
export async function getPlaylist(filters) {
  let has_where = false;
  let query = db.tracks;

  // the where uses an index, but the and doesn't, it's filtered in memory.
  // so we need to use the most restrictive filter first.
  // in dexie you can only have one where

  // add artist filters
  if (filters.artists.length > 0) {
    query = query.where("artists").anyOf(filters.artists);
    has_where = true;
  }

  // add rating filters
  if (filters.rating?.length > 0) {
    if (!has_where) {
      query = query.where("rating").anyOf(filters.rating);
      has_where = true;
    } else {
      query = query.and((track) => filters.rating.includes(track.rating));
    }
  }

  // add starred filter
  if (filters.starred !== undefined) {
    // find all starred/unstarred artists
    // (dexie doesn't do joins, you have to do it yourself)
    const filterArtistIds = await db.artists
      .where({ starred: filters.starred })
      .toArray()
      .map((a) => a.id);

    if (!has_where) {
      query = query.where("artists").anyOf(filterArtistIds);
      has_where = true;
    } else {
      query = query.and((track) =>
        track.artists.some((a) => filterArtistIds.includes(a))
      );
    }
  }

  // add tag filters TODO

  // get playlist with filters
  let playlist = await query.toArray().map((t) => pick(t, ["id", "url"]));

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
