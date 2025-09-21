import { stripSupportedUrl } from "../../utils";
import { dexie } from "../database/dexie";
import { Tracks } from "../models";
import { trackRepository } from "../repository";

async function getTrackByUrl(url) {
  // strip url if supported
  url = stripSupportedUrl(url);

  const track = await trackRepository.getTrackByUrl(url);
  return track;
}

/**
 * add a new track.
 * creates artists and tags if they're missing.
 * TODO
 */
async function createTrack(trackData) {
  // artists is given as an array of artist ids
  // and tags as an array of tag ids
  // const { artists, tags, ...track } = trackData;
  const track = trackData;
  track.url = stripSupportedUrl(track.url); // strip url if supported

  return await dexie.transaction(
    "rw",
    Tracks.model,
    // db.artists,
    // db.tags,
    async () => {
      // check that url does not exist
      const existing = await getTrackByUrl(track.url);
      if (existing != null) throw Error("That URL has already been saved");

      // create track object
      const newTrack = trackRepository.createTrack(trackData);

      // add artists and tags to track
      // await editTrackArtists(id, artists);
      // await editTrackTags(id, tags);

      return newTrack;
    }
  );
}

/** edit an existing track */
async function editTrack(id, trackData) {
  // const { artists, tags, ...track } = trackData;
  const track = trackData;
  track.url = stripSupportedUrl(track.url); // strip url if supported

  return await dexie.transaction(
    "rw",
    Tracks.model,
    // db.artists,
    // db.tags,
    async () => {
      // get current track data
      const currentTrack = await trackRepository.getTrackById(id);

      // if url was changed, check that new url does not exist
      if (track.url !== currentTrack.url) {
        const existing = await getTrackByUrl(track.url);
        if (existing != null) throw Error("That URL has already been saved");
      }

      // update track
      const editedTrack = await trackRepository.updateTrack(id, track);

      // add artists and tags to track
      // await editTrackArtists(id, artists);
      // await editTrackTags(id, tags);

      // return edited track
      return editedTrack;
    }
  );
}

/** edit the mappings from track to artists (add or remove track artists) */
// async function editTrackArtists(trackId, artistIds, transaction = null) {
//   // delete all existing mappings
//   await TrackArtist.destroy({ where: { trackId }, transaction });

//   // add new ones
//   for (let artistId of artistIds) {
//     await TrackArtist.create(
//       { id: uuid(), artistId, trackId, main: false },
//       { transaction }
//     );
//   }
// }

/** edit the mapping from track to tags */
// async function editTrackTags(trackId, tagIds, transaction = null) {
//   // delete all existing mappings
//   await TrackTag.destroy({ where: { trackId }, transaction });

//   // add new ones
//   for (let tagId of tagIds) {
//     await TrackTag.create({ id: uuid(), tagId, trackId }, { transaction });
//   }
// }

export const trackService = {
  ...trackRepository,
  getTrackByUrl,
  createTrack,
  editTrack,
};
