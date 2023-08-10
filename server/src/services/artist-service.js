import { v4 as uuid } from "uuid";
import { sequelize, Artist } from "../../src/index.js";

export async function getAllArtists() {
  const inquiry = "SELECT id, name FROM artists ORDER BY name";
  const result = await select(inquiry);

  return result;
}

export async function artistMatch(string) {
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
