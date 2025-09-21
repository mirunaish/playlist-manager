import { buildRecord, randomUUID } from "../../utils";
import { dexie } from "../database/dexie";
import { Tags } from "../models";

async function getAllTags() {
  const tags = await Tags.findAll({}, { orderBy: "name" });
  const record = buildRecord(tags.map((t) => t.data));

  return record;
}

async function getTagById(id) {
  const tag = await Tags.findById(id);
  if (!tag) throw Error("Tag does not exist.");
  return tag.data;
}

async function getTagByName(name) {
  const tag = await Tags.findOne({ name });
  if (tag === null) throw Error("Tag does not exist.");
  return tag.data;
}

async function createTag(tagData) {
  const id = randomUUID();
  if (!tagData.color) tagData.color = "#7f7f7f";

  return await dexie.transaction("rw", Tags.model, async () => {
    // make sure another tag with the same name doesn't already exist
    const existing = await getTagByName(tagData.name);
    if (existing) throw Error("Tag with that name already exists");

    const newTag = new Tags({ id, ...tagData });
    await newTag.save();
    return newTag.data;
  });
}

async function editTag(id, tagData) {
  return await dexie.transaction("rw", Tags.model, async () => {
    // get existing tag
    const tag = await getTagById(id);
    if (!tag) throw Error("Tag does not exist");

    // if name was changed, check that new name does not exist
    if (tagData.name !== tag.data.name) {
      const existing = await getTagByName(tagData.name);
      if (existing != null) throw Error("A tag with that name already exists");
    }

    // update tag
    tag.set(tagData);
    await tag.save();

    // return edited tag
    return tag.data;
  });
}

async function deleteTag(id) {
  const tag = await getTagById(id);
  if (!tag) return;
  await tag.delete();
}

export const tagRepository = {
  getAllTags,
  getTagById,
  getTagByName,
  createTag,
  editTag,
  deleteTag,
};
