import { buildRecord, randomUUID } from "../../utils";
import { Artists } from "../models";

/** returns a record */
async function getAllArtists() {
  const artists = await Artists.findAll({}, { orderBy: "name" });
  return buildRecord(artists.map((a) => a.data));
}

async function getArtists(filter) {
  const artists = await Artists.findAll(filter, { orderBy: "name" });
  return artists.map((a) => a.data);
}

async function getArtistById(id) {
  const artist = await Artists.findById(id);
  if (!artist) throw Error("Artist does not exist.");
  return artist.data;
}

async function getArtistsByIds(ids) {
  const artists = await Artists.findAll({ id: ids });
  return artists.map((a) => a.data);
}

async function getArtistByName(name) {
  const artist = await Artists.findOne({
    name: { value: name, ignoreCase: true },
  });
  return artist?.data;
}

async function createArtist(artistData) {
  const id = randomUUID();
  if (!artistData.starred) artistData.starred = false;

  const artist = new Artists({ ...artistData, id });
  await artist.save();
  return artist.data;
}

async function loadArtists(artists) {
  await Artists.load(artists);
}

export const artistRepository = {
  getAllArtists,
  getArtists,
  getArtistById,
  getArtistsByIds,
  getArtistByName,
  createArtist,
  loadArtists,
};
