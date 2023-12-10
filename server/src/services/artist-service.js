import { v4 as uuid } from "uuid";
import { sequelize, Artist } from "../../src/index.js";
import { Op } from "sequelize";

export async function getAllArtists(zoneId) {
  const result = await Artist.findAll({
    where: { zoneId },
    order: [["name", "ASC"]],
  });

  return result;
}

export async function artistMatch(string, zoneId) {
  // return array of ids given string of names (in the current zone)
  // if no matches, create new artist and return id
  const ids = [];
  const names = string.split(",").map((s) => s.trim());

  for (let name of names) {
    // does the artist exist? (case insensitive)
    let id = (
      await Artist.findOne({
        where: { zoneId, name: { [Op.iLike]: name } },
      })
    )?.id;

    // if not, create them
    if (!id) id = await createArtist({ name, zoneId });

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
