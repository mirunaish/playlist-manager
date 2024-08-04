import { v4 as uuid } from "uuid";
import { sequelize, Tag } from "../../src/index.js";

export async function getAllTags() {
  const result = await Tag.findAll({
    order: [["name", "ASC"]],
  });

  return result;
}

export async function createTag(tagData) {
  const id = uuid();
  await Tag.create({ ...tagData, id });
  return id;
}
