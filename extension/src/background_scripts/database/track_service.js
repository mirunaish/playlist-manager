import { v4 as uuid } from "uuid";
import { db } from "./database";

export async function getTrackById(id) {
  try {
    let track = await db.tracks.get(id);
    if (track === null) throw Error("Not found");
    return track;
  } catch (e) {
    console.error("database error:", e);
    throw Error("Could not get track: " + e.message);
  }
}

/** returns either the track or null if track was not found */
export async function getTrackByUrl(url) {
  try {
    let track = await db.tracks.get({ url });
    return track;
  } catch (e) {
    console.error("database error:", e);
    throw Error("Could not get track: " + e.message);
  }
}

// TODO
// export async function getTrackByTitleArtist() {
//   return;
// }

// TODO
// export async function getTracksByTitle() {
//   return;
// }

/**
 * add a new track.
 * creates artists and tags if they're missing.
 * TODO
 */
export async function createTrack(trackData) {
  try {
    // artists is given as an array of artist ids
    // and tags as an array of tag ids
    // const { artists, tags, ...track } = trackData;
    const track = trackData;

    return await db.transaction(
      "rw",
      db.tracks,
      // db.artists,
      // db.tags,
      async () => {
        // check that url does not exist
        const existing = await db.tracks.get({ url: track.url });
        if (existing != null) throw Error("That URL has already been saved");

        // create track object
        let id = uuid();
        await db.tracks.add({ ...track, id });

        // add artists and tags to track
        // await editTrackArtists(id, artists);
        // await editTrackTags(id, tags);

        // return the new track object
        const newTrack = await getTrackById(id);

        return newTrack;
      }
    );
  } catch (e) {
    console.error("database error:", e);
    throw Error("Failed to create track: " + e.message);
  }
}

/** edit an existing track */
export async function editTrack(id, trackData) {
  try {
    // const { artists, tags, ...track } = trackData;
    const track = trackData;

    return await db.transaction(
      "rw",
      db.tracks,
      // db.artists,
      // db.tags,
      async () => {
        // get current track data
        const currentData = await getTrackById(id);

        // if url was changed, check that new url does not exist
        if (track.url !== currentData.url) {
          const existing = await db.tracks.get({ url: track.url });
          if (existing != null) throw Error("That URL has already been saved");
        }

        // update track
        await db.tracks.update(id, { ...track });

        // add artists and tags to track
        // await editTrackArtists(id, artists);
        // await editTrackTags(id, tags);

        // return edited track
        const newTrack = await getTrackById(id);
        return newTrack;
      }
    );
  } catch (e) {
    console.error("database error:", e);
    throw Error("Failed to edit track: " + e.message);
  }
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
