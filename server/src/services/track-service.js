import { v4 as uuid } from "uuid";
import { sequelize, Track, Artist, TrackArtist } from "../../src/index.js";

export async function getTrackById(id) {
  const inquiry = "SELECT * FROM tracks WHERE id='" + id + "'";
  let track = (await select(inquiry))[0];
  if (track == null) throw "could not find track";
  track.artist = await getTrackArtists(track.id);

  return track;
}

export async function getTrackByUrl(url) {
  const inquiry = "SELECT * FROM tracks WHERE url='" + url + "'";
  let track = (await select(inquiry))[0];
  if (track == null) throw "could not find track";
  track.artist = await getTrackArtists(track.id);

  return track;
}

// todo
export async function getTrackByTitleArtist() {
  return;
}

async function getTrackArtists(id) {
  let inquiry = "SELECT artists.name FROM authorships LEFT JOIN tracks ";
  inquiry += "ON authorships.track=tracks.id LEFT JOIN artists ON ";
  inquiry += "authorships.artist=artists.id WHERE tracks.id='" + id + "'";
  const result = await select(inquiry);

  let artist = result[0].name;
  for (let i = 1; i < result.length; i++) {
    artist += ", " + result[i].name;
  }
  return artist;
}

// add a new track
export async function add(data) {
  const { artist, ...trackData } = data;

  // check that url does not exist
  const inquiry = "SELECT * FROM tracks WHERE url='" + trackData.url + "'";
  if ((await select(inquiry))[0]) throw "track already exists";

  let id = uuid();
  let keys = "id";
  let values = "'" + id + "'";
  for (let key in trackData) {
    keys += ", " + key;
    values += ", '" + s(trackData[key]) + "'";
  }
  await query("INSERT INTO tracks (" + keys + ") VALUES (" + values + ");");

  const artistIds = await artistMatch(artist);
  await editTrackArtists(id, artistIds);

  return await getTrackById(id);
}

// edit an existing track
export async function edit(id, data) {
  const { artist, ...trackData } = data;

  let inquiry = "UPDATE tracks SET ";
  for (let key in trackData) {
    inquiry += key + "='" + s(trackData[key]) + "', ";
  }
  inquiry = inquiry.slice(0, -2); // remove last 2 characters (", ")
  inquiry += " WHERE id='" + id + "';";
  await query(inquiry);

  const artistIds = await artistMatch(artist);
  await editAuthorships(id, artistIds);

  return await getTrackById(id);
}

async function editTrackArtists(track, artists) {
  // delete all existing authorships
  await query("DELETE FROM authorships WHERE track='" + track + "';");
  // add new authorships
  for (let i = 0; i < artists.length; i++) {
    let artist = artists[i];
    let inquiry = "INSERT INTO authorships (id, track, artist) VALUES ";
    inquiry += "('" + uuid() + "', '" + track + "', '" + artist + "');";
    await query(inquiry);
  }
}
