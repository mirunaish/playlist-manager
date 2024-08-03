import { Op } from "sequelize";
import { sequelize, Track, Artist, TrackArtist } from "../../src/index.js";
import { getTrackArtists } from "./track-service.js";
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
        where: { [Op.or]: artistWhere },
      },
    });
  }

  // add tag filters TODO

  // get playlist with filters
  let playlist = await Track.findAll({ where, include });

  if (playlist.length == 0) {
    throw "Found no tracks matching these filters";
  }

  // TODO simplify this?
  // get artists for each track, as an array of { id, name }
  for (let track of playlist) {
    track.artists = await getTrackArtists(track.id);
    track.artistString = track.artists.map((a) => a.name).join(", ");
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

  // TODO remove this
  playlist = [
    ...playlist,
    {
      id: "ababa",
      title: "test title",
      rating: 5,
      imageLink: "https://i.ytimg.com/vi/8S6YkfSDZdw/hqdefault.jpg",
      artists: ["8e3089e0-00b0-4eb8-9b1f-a4f340926c88"],
      artistString: "itemLabel",
    },
    {
      id: "rhuhgir",
      title: "test title 2",
      rating: 3,
      imageLink: "https://i.ytimg.com/vi/8S6YkfSDZdw/hqdefault.jpg",
      artists: ["8e3089e0-00b0-4eb8-9b1f-a4f340926c88"],
      artistString: "itemLabel",
    },
    {
      id: "huifhufs",
      title: "test title 3",
      rating: 1,
      imageLink: "https://i.ytimg.com/vi/8S6YkfSDZdw/hqdefault.jpg",
      artists: ["8e3089e0-00b0-4eb8-9b1f-a4f340926c88"],
      artistString: "itemLabel",
    },
  ];

  return { playlist, stats };
}
