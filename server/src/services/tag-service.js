import { v4 as uuid } from "uuid";
import { sequelize, Tag, TrackTag } from "../../src/index.js";

export async function getAllTags() {
  const result = await Tag.findAll({
    order: [["name", "ASC"]],
  });

  return result;
}

export async function getTagById(id) {
  const tag = await Tag.findByPk(id);
  if (tag === null) throw Error("could not find tag");
}

export async function createTag(tagData) {
  const id = uuid();
  await Tag.create({ ...tagData, id });
  return id;
}

export async function editTag(id, tagData) {
  // update tag
  await Tag.update({ ...tagData }, { where: { id } });

  // return edited tag
  return await getTagById(id);
}

export async function deleteTag(id) {
  // remove tag from all tracks
  await TrackTag.remove({ where: { tagId: id } });

  // delete tag
  await Tag.remove({ where: { id } });
}
