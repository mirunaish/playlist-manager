import { v4 as uuid } from "uuid";
import { db } from "./database";

export async function getAllTags() {
  try {
    return await db.tags.orderBy("name").toArray();
  } catch (e) {
    console.error("database error:", e);
    throw Error("Could not get tags: " + e.message);
  }
}

export async function getTagById(id) {
  try {
    const tag = await db.tags.get(id);
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
      await db.tags.add({ ...tagData, id });
      return await getTagById(id);
    });
  } catch (e) {
    console.error("database error:", e);
    throw Error("Failed to create tag: " + e.message);
  }
}

export async function editTag(id, tagData) {
  try {
    return await db.transaction("rw", db.tags, async () => {
      // update tag
      const result = await db.tags.update(id, { ...tagData });
      if (result === 0) throw Error("Tag does not exist");

      // return edited tag
      return await getTagById(id);
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
    });
  } catch (e) {
    console.error("database error:", e);
    throw Error("Failed to delete tag: " + e.message);
  }
}
