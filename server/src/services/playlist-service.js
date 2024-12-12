import { Op } from "sequelize";
import {
  sequelize,
  Track,
  Artist,
  TrackArtist,
  TrackTag,
  Tag,
} from "../../src/index.js";
import { getTrackArtists, getTrackTags } from "./track-service.js";
import { removeFromArray } from "../util.js";

function getPlaylistStats(playlist) {
  let stats = {};

  return stats;
}

// filter + sort tracks
export async function getPlaylist(filters) {
  // build filters
  let where = {};
  const include = [];

  // add rating filters
  if (filters.rating.length > 0) {
    where = { ...where, rating: { [Op.in]: filters.rating } };
  }

  // add artist filters
  if (filters.artists.length > 0) {
    // artist filter is an array of either "starred", "not starred", or an id

    const artistWhere = [];
    if (filters.artists.includes("starred")) {
      removeFromArray(filters.artists, "starred");
      artistWhere.push({ starred: true });
    }
    if (filters.artists.includes("not starred")) {
      removeFromArray(filters.artists, "not starred");
      artistWhere.push({ starred: false });
    }
    if (filters.artists.length > 0) {
      // rest must be ids
      artistWhere.push({ id: { [Op.in]: filters.artists } });
    }

    include.push({
      model: TrackArtist,
      required: true,
      attributes: [],
      include: {
        model: Artist,
        required: true,
        attributes: [],
        where: { [Op.and]: artistWhere },
      },
    });
  }

  // add tag filters TODO
  // include.push({
  //   model: TrackTag,
  //   required: true,
  //   attributes: [],
  //   include: {
  //     model: Tag,
  //     required: true,
  //     attributes: ["id", "color", "name"],
  //     // where: { [Op.and]: tagWhere },
  //   },
  // });

  // get playlist with filters
  let playlist = await Track.findAll({
    raw: true,
    attributes: ["id", "url"],
    where,
    include,
  });

  if (playlist.length == 0) {
    throw "Found no tracks matching these filters";
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

  // get playlist stats
  const stats = getPlaylistStats(playlist);

  return { playlist, stats };
}
