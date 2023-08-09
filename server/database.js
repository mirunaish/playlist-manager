import pg from "pg";
import { v4 as uuid } from "uuid";
import dotenv from "dotenv";
dotenv.config();

var pgClient = new pg.Client(process.env.DATABASE_URL);
pgClient.connect();

async function select(inquiry) {
  var response = await pgClient.query(inquiry);
  return response.rows;
}

// non-select query (does not return anything)
async function query(inquiry) {
  await pgClient.query(inquiry);
}

// prepare user-imputted values for sql query
function s(string) {
  // replace ' with ''
  return string.replace(/'/g, "''");
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

export async function createArtist(artistData) {
  let id = uuid();
  let keys = "id";
  let values = "'" + id + "'";
  for (let key in artistData) {
    keys += ", " + key;
    values += ", '" + s(artistData[key]) + "'";
  }
  await query("INSERT INTO artists (" + keys + ") VALUES (" + values + ");");
  return id;
}

async function artistMatch(string) {
  // return array of ids given string of names
  // if no matches, create new artist and return id
  const ids = [];
  const names = string.split(", ");
  for (let i = 0; i < names.length; i++) {
    let name = names[i];
    // does the artist exist?
    let inquiry = "SELECT id FROM artists WHERE ";
    inquiry += "UPPER(name)=UPPER('" + s(name) + "');";
    let id = (await select(inquiry))[0]?.id;
    // if not, create them
    if (!id) id = await createArtist({ name });
    ids.push(id);
  }
  return ids;
}

async function editAuthorships(track, artists) {
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

export async function getAllArtists() {
  const inquiry = "SELECT id, name FROM artists ORDER BY name";
  const result = await select(inquiry);

  return result;
}

// filter + sort tracks
export async function getPlaylist(filters) {
  // build query
  const where = [];

  // add rating filters
  if (filters.rating != null) {
    if (filters.rating === "3+") {
      where.push("rating IN ('3', '4', '5')");
    } else {
      where.push("rating='" + s(filters.rating) + "'");
    }
  }

  // add artist filters
  if (filters.artist != null) {
    if (filters.artist === "not star") {
      // get list of non-starred artists
      // todo fix this
      let inquiry = "SELECT id FROM artists WHERE";
      inquiry += "(SELECT COUNT(*) FROM authorships WHERE artist=artists.id)<3";
      let notStar = await select(inquiry);

      let clause = "artists.id IN (none";
      notStar.forEach((artist) => {
        clause += ", '" + artist + "'";
      });
      clause += ")";
      where.push(clause);
    } else {
      where.push("artists.id='" + filters.artist + "'");
    }
  }

  let inquiry = "SELECT tracks.id, tracks.title FROM tracks";
  if (filters.artist != null) {
    inquiry += " JOIN authorships ON tracks.id=authorships.track";
    inquiry += " JOIN artists ON authorships.artist=artists.id";
  }
  if (where.length > 0) {
    inquiry += " WHERE ";
    for (let i = 0; i < where.length - 1; i++) {
      inquiry += where[i] + " AND ";
    }
    inquiry += where[where.length - 1];
  }

  // get playlist with filters
  let playlist = await select(inquiry);

  if (playlist.length == 0) {
    throw "found no tracks matching these filters";
  }

  // TODO simplify this?
  // get artists for each track
  for (let i = 0; i < playlist.length; i++) {
    playlist[i].artist = await getTrackArtists(playlist[i].id);
  }

  // sort
  if (filters["sort"] === "shuffle") {
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
  await editAuthorships(id, artistIds);

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
