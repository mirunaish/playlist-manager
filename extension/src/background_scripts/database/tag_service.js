import { v4 as uuid } from "uuid";
import { db } from "./database";
import { buildRecord } from "../utils";
import { tagCache } from "./caches";

export async function getAllTags() {
  if (tagCache.valid) return tagCache.data;

  try {
    const tags = await db.tags.orderBy("name").toArray();
    const record = buildRecord(tags);

    tagCache.data = record;
    tagCache.valid = true;

    return record;
  } catch (e) {
    console.error("database error:", e);
    throw Error("Could not get tags: " + e.message);
  }
}

export async function getTagsByIds(ids) {
  if (tagCache.valid) return ids.map((id) => tagCache.data[id]);

  const tags = await db.tags.where("id").anyOf(ids).toArray();
  // NOTE: these might not be in the same order as the ids
  return tags;
}

export async function getTagById(id) {
  try {
    const tag = tagCache.valid ? tagCache.data[id] : await db.tags.get(id);
    if (!tag) throw Error("Tag does not exist.");
    return tag;
  } catch (e) {
    console.error("database error:", e);
    throw Error("Could not get tag: " + e.message);
  }
}

export async function getTagByName(name) {
  try {
    const tag = await db.tags.get({ name });
    if (tag === null) throw Error("Tag does not exist.");
    return tag;
  } catch (e) {
    console.error("database error:", e);
    throw Error("Could not get tag: " + e.message);
  }
}

export async function createTag(tagData) {
  try {
    const id = uuid();
    if (!tagData.color) tagData.color = "#7f7f7f";

    return await db.transaction("rw", db.tags, async () => {
      // make sure another tag with the same name doesn't already exist
      const existing = await getTagByName(tagData.name);
      if (existing) throw Error("Tag with that name already exists");

      await db.tags.add({ ...tagData, id });
      const newTag = await getTagById(id);
      tagCache.data[newTag.id] = newTag; // update cache
      return newTag;
    });
  } catch (e) {
    console.error("database error:", e);
    throw Error("Failed to create tag: " + e.message);
  }
}

export async function editTag(id, tagData) {
  try {
    return await db.transaction("rw", db.tags, async () => {
      // get existing tag
      const currentData = await getTagById(id);
      if (!currentData) throw Error("Tag does not exist");

      // if url was changed, check that new url does not exist
      if (tagData.name !== currentData.name) {
        const existing = await getTagByName(tagData.name);
        if (existing != null)
          throw Error("A tag with that name already exists");
      }

      // update tag
      await db.tags.update(id, { ...tagData });

      const editedTag = await getTagById(id);
      if (!editedTag) throw Error("Tag does not exist");

      tagCache.data[editedTag.id] = editedTag; // update cache

      // return edited tag
      return editedTag;
    });
  } catch (e) {
    console.error("database error:", e);
    throw Error("Failed to edit tag: " + e.message);
  }
}

export async function deleteTag(id) {
  try {
    return await db.transaction("rw", db.tags, db.tracks, async () => {
      // remove tag from all tracks
      await db.tracks.where({ tags: id }).modify((track) => ({
        ...track,
        tags: track.tags.filter((t) => t !== id),
      }));
      // delete tag
      await db.tags.delete(id);
      tagCache.data[id] = undefined;
    });
  } catch (e) {
    console.error("database error:", e);
    throw Error("Failed to delete tag: " + e.message);
  }
}
