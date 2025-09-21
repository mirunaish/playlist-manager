import { randomUUID } from "../../utils";
import { Tracks } from "../models";

async function getTracks(filters) {
  const tracks = await Tracks.findAll(filters);
  return tracks.map((t) => t.data);
}

async function getTrackById(id) {
  const track = await Tracks.findById(id);
  if (!track) throw Error("Track does not exist.");
  return track.data;
}

/** returns either the track or null if track was not found */
async function getTrackByUrl(url) {
  let track = await Tracks.findOne({ url });
  if (!track) return null;
  return track.data;
}

// TODO
// async function getTrackByTitleArtist() {
//   return;
// }

// TODO
// async function getTracksByTitle() {
//   return;
// }

async function createTrack(trackData) {
  let id = randomUUID();
  const newTrack = new Tracks({ id, ...trackData });
  await newTrack.save();
  return newTrack.data;
}

async function updateTrack(id, trackData) {
  const currentTrack = await getTrackById(id);
  currentTrack.set(trackData);
  await currentTrack.save();
  return currentTrack.data;
}

async function removeTagFromTracks(tagId) {
  await Tracks.modify({ tags: tagId }, (track) => ({
    ...track,
    tags: track.tags.filter((t) => t !== tagId),
  }));
}

export const trackRepository = {
  getTracks,
  getTrackById,
  getTrackByUrl,
  createTrack,
  updateTrack,
  removeTagFromTracks,
};
