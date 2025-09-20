import { v4 as uuid } from "uuid";
import { db } from "./database";
import { buildRecord } from "../../util";
import { artistCache } from "./caches";

// returns a record
export async function getAllArtists() {
  if (artistCache.valid) return artistCache.data;

  try {
    const artists = await db.artists.orderBy("name").toArray();
    const record = buildRecord(artists);

    artistCache.data = record;
    artistCache.valid = true;

    return record;
  } catch (e) {
    console.error("database error:", e);
    throw Error("Failed to get artists: " + e.message);
  }
}

export async function getArtistById(id) {
  try {
    const artist = artistCache.valid
      ? artistCache.data[id] // get artist from cache if valid
      : await db.artists.get(id); // otherwise fetch from db

    if (!artist) throw Error("Artist does not exist.");

    return artist;
  } catch (e) {
    console.error("database error:", e);
    throw Error("Could not get artist: " + e.message);
  }
}

export async function getArtistsByIds(ids) {
  if (artistCache.valid) return ids.map((id) => artistCache.data[id]);

  const artists = await db.artists.where("id").anyOf(ids).toArray();
  return artists;
}

export async function getArtistByName(name) {
  try {
    return await db.artists.where("name").equalsIgnoreCase(name).first();
  } catch (e) {
    console.error("database error:", e);
    throw Error("Could not get artist by name: " + e.message);
  }
}

export async function getTrackArtists(trackId) {
  try {
    // get the track
    // can't use getTrackById because of circular imports
    const track = await db.tracks.get(trackId);

    if (artistCache.valid)
      return track.artists.map((id) => artistCache.data[id]);

    // need to do it this way to get them in order
    const artists = await Promise.all(
      track.artists.map(async (artistId) => await db.artists.get(artistId))
    );

    return artists;
  } catch (e) {
    console.error("database error:", e);
    throw Error("Could not get artists for track: " + e.message);
  }
}

/**
 * for each name, add the id if the artist exists
 * maintain the order of the names...
 */
export async function artistMatch(names) {
  const artists = [];

  for (let name of names) {
    // does the artist exist? (case insensitive)
    const id = (await db.artists.where("name").equalsIgnoreCase(name).first())
      ?.id;

    // add this artist's id or an object containing the name
    artists.push(!!id ? id : { isReal: false, name });
  }
  return artists;
}

export async function createArtist(artistData) {
  try {
    const id = uuid();
    if (!artistData.starred) artistData.starred = false;

    return await db.transaction("rw", db.artists, async () => {
      await db.artists.add({ ...artistData, id });
      const newArtist = await getArtistById(id);
      artistCache[newArtist.id] = newArtist; // update cache
      return newArtist;
    });
  } catch (e) {
    console.error("database error:", e);
    throw Error("Failed to create artist: " + e.message);
  }
}
