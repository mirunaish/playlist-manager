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
    if (!id) id = await createArtist({ name });

    // add this artist's id
    ids.push(id);
  }
  return ids;
}

export async function createArtist(artistData) {
  const id = uuid();
  await Artist.create({ starred: false, ...artistData, id });
  return id;
}
