import { v4 as uuid } from "uuid";
import { sequelize, Track, Artist, TrackArtist } from "../../src/index.js";
import { artistMatch } from "./artist-service.js";

export async function getTrackById(id) {
  let track = Track.findOne({ where: { id } });
  if (track == null) throw "could not find track";
  track.artist = await getTrackArtists(track.id);

  return track;
}

export async function getTrackByUrl(url) {
  let track = Track.findOne({ where: { url } });
  if (track == null) throw "could not find track";
  track.artist = await getTrackArtists(track.id);

  return track;
}

// TODO
export async function getTrackByTitleArtist() {
  return;
}

/** get a comma-separated string of names of this track's artists */
export async function getTrackArtists(trackId) {
  // get all artists on this track
  const result = await Artist.findAll({
    include: [{ model: TrackArtist, required: true, where: { trackId } }],
    where: [],
  });

  // list the names separated by commas
  return result.map((a) => a.name).join(", ");
}

/** add a new track */
export async function add(data) {
  const { artist, ...trackData } = data;
  // artist is given as a comma-separated string of names (for now)
  // TODO change this?

  // check that url does not exist
  const existing = await Track.findOne({
    where: { url: trackData.url, zoneId: trackData.zoneId },
  });
  if (existing != null) throw "track already exists";

  // create track object
  let id = uuid();
  await Track.create({ ...trackData, id });

  // create mapping to artists
  const artistIds = await artistMatch(artist);
  await editTrackArtists(id, artistIds);

  // return the new track object
  return await getTrackById(id);
}

/** edit an existing track */
export async function edit(id, data) {
  const { artist, ...trackData } = data;

  // update track
  await Track.update({ ...trackData }, { where: { id } });

  // update artist mapping
  const artistIds = await artistMatch(artist);
  await editTrackArtists(id, artistIds);

  // return edited track
  return await getTrackById(id);
}

/** edit the mappings from track to artists (add or remove track artists) */
async function editTrackArtists(trackId, artistIds) {
  // delete all existing mappings
  await TrackArtist.destroy({ where: { trackId } });

  // add new ones
  for (let artistId of artistIds) {
    TrackArtist.create({ id: uuid(), artistId, trackId });
  }
}
