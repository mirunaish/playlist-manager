import { v4 as uuid } from "uuid";
import { sequelize, Artist } from "../../src/index.js";
import { Op } from "sequelize";

export async function getAllArtists() {
  const result = await Artist.findAll({
    order: [["name", "ASC"]],
  });

  return result;
}

export async function artistMatch(string) {
  // return array of ids given string of names
  // if no matches, create new artist and return id
  const ids = [];
  const names = string.split(",").map((s) => s.trim());

  for (let name of names) {
    // does the artist exist? (case insensitive)
    let id = (
      await Artist.findOne({
        where: { name: { [Op.iLike]: name } },
      })
    )?.id;

    // if not, create them
    if (!id) id = (await createArtist({ name })).id;

    // add this artist's id
    ids.push(id);
  }
  return ids;
}

export async function createArtist(artistData, transaction = null) {
  const id = uuid();
  if (!artistData.starred) artistData.starred = false;
  const artist = await Artist.create({ ...artistData, id }, { transaction });
  return artist;
}
