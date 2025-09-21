import { dexie } from "../database/dexie";
import { Tags, Tracks } from "../models";
import { tagRepository, trackRepository } from "../repository";

async function getTrackTags(trackId) {
  // get the track
  const track = await trackRepository.getTrackById(trackId);

  // need to do it this way to get them in order
  const tags = await Promise.all(
    track.tags.map(async (tagId) => await tagRepository.getTagById(tagId))
  );

  return tags;
}

async function deleteTag(id) {
  return await dexie.transaction("rw", [Tags.model, Tracks.model], async () => {
    // remove tag from all tracks
    await trackRepository.removeTagFromTracks(id);

    // delete tag
    await tagRepository.deleteTag(id);
  });
}

export const tagService = {
  ...tagRepository,
  getTrackTags,
  deleteTag,
};
