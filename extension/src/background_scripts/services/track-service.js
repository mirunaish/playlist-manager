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
  if (!track.addedAt) track.addedAt = new Date(); // added is now by default
  track.lastPlayedAt = track.addedAt;
  track.plays = 1;
  track.skips = 0;

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
    },
  );
}

/** edit an existing track */
async function editTrack(id, trackData) {
  // const { artists, tags, ...track } = trackData;
  const track = trackData;
  if (track.url) track.url = stripSupportedUrl(track.url); // strip url if supported

  return await dexie.transaction(
    "rw",
    Tracks.model,
    // db.artists,
    // db.tags,
    async () => {
      // get current track data
      const currentTrack = await trackRepository.getTrackById(id);

      // if url was changed, check that new url does not exist
      if (track.url && track.url !== currentTrack.url) {
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
    },
  );
}

async function addPlay(id) {
  // get track number of plays
  const track = await trackRepository.getTrackById(id);
  await editTrack(id, {
    plays: track.plays + 1,
    lastPlayedAt: new Date(),
  });
}

async function addSkip(id) {
  const track = await trackRepository.getTrackById(id);
  await editTrack(id, {
    skips: track.skips + 1,
  });
}

function sortTracks(tracks, key, sortDirection = "DESC") {
  const type = Tracks.fields[key].type;
  const keyFunc = type === "datetime" ? (v) => new Date(v[key]) : (v) => v[key];
  const sortedTracks = tracks.sort((a, b) => keyFunc(b) > keyFunc(a));
  if (sortDirection === "ASC") return sortedTracks.reverse();
  else return sortedTracks;
}

export const trackService = {
  ...trackRepository,
  // overwrite the repository methods...
  getTrackByUrl,
  createTrack,
  editTrack,
  addPlay,
  addSkip,
  sortTracks,
};
