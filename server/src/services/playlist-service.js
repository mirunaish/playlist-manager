import { Op } from "sequelize";
import { sequelize, Track, Artist, TrackArtist } from "../../src/index.js";
import { getTrackArtists } from "./track-service.js";

// filter + sort tracks
export async function getPlaylist(filters) {
  // build filters
  let where = {};
  const include = [];

  // add rating filters
  if (filters.rating != null) {
    where = { ...where, rating: { [Op.in]: filters.rating } };
  }

  // add artist filters
  if (filters.artist != null) {
    // artist filter is either "starred", "not starred", or an array of names

    include.push({ model: TrackArtist, required: true });

    let artistWhere;
    if (filters.artist === "starred") {
      artistWhere = { starred: true };
    } else if (filters.artist === "not starred") {
      artistWhere = { starred: false };
    } else {
      artistWhere = { id: { [Op.in]: filters.artist } };
    }
    include.push({ model: Artist, required: true, where: artistWhere });
  }

  // add tag filters TODO

  // get playlist with filters
  let playlist = await Track.findAll({ where, include });

  if (playlist.length == 0) {
    throw "found no tracks matching these filters";
  }

  // TODO simplify this?
  // get artists for each track
  for (let track of playlist) {
    track.artist = await getTrackArtists(track.id);
  }

  // sort TODO add more sorts
  if (filters.sort === "shuffle") {
    // shuffle the playlist
    for (let i = 0; i < playlist.length - 1; i++) {
      // pick random track and move it to the front
      let j = Math.floor(i + Math.random() * (playlist.length - i));
      // swap
      [playlist[i], playlist[j]] = [playlist[j], playlist[i]];
    }
  }

  return playlist;
}
