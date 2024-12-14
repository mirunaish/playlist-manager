import { v4 as uuid } from "uuid";
import {
  sequelize,
  Track,
  Artist,
  TrackArtist,
  Tag,
  TrackTag,
} from "../../src/index.js";
import { createArtists } from "./artist-service.js";
import { createTags } from "./tag-service.js";

export async function getTrackById(id, transaction = null) {
  let track = await Track.findByPk(id, { transaction });
  if (track === null) throw Error("could not find track");
  track.artist = await getTrackArtists(track.id, transaction);
  track.tags = await getTrackTags(track.id, transaction);

  return track;
}

export async function getTrackByUrl(url) {
  let track = await Track.findOne({ raw: true, where: { url } });
  if (track === null) throw Error("could not find track");
  track.artists = await getTrackArtists(track.id);
  track.tags = await getTrackTags(track.id);

  return track;
}

// TODO
export async function getTrackByTitleArtist() {
  return;
}

// TODO
export async function getTracksByTitle() {
  return;
}

/** get an array of ids of artists */
export async function getTrackArtists(trackId, transaction = null) {
  // get all artists on this track
  const result = await Artist.findAll({
    raw: true,
    attributes: ["id"], // select the id of each
    include: [
      {
        model: TrackArtist,
        required: true,
        where: { trackId },
        attributes: [], // don't select anything from trackartists
      },
    ],
    transaction,
  });

  return result.map((a) => a.id);
}

/** get an array of ids */
export async function getTrackTags(trackId, transaction = null) {
  // get all tags on this track
  const result = await Tag.findAll({
    attributes: ["id"],
    raw: true,
    include: [
      { model: TrackTag, required: true, where: { trackId }, attributes: [] },
    ],
    transaction,
  });

  return result.map((t) => t.id);
}

/**
 * add a new track.
 * creates artists and tags if they're missing.
 * and also creates mappings between track and artists and tags
 */
export async function createTrack(trackData, newArtists, newTags) {
  const transaction = await sequelize.transaction();

  try {
    // artists is given as an array of artist ids
    // and tags as an array of tag ids
    const { artists, tags, ...track } = trackData;

    // check that url does not exist
    const existing = await Track.findOne({
      where: { url: track.url },
      transaction,
    });
    if (existing != null) throw Error("track already exists");

    // create track object
    let id = uuid();
    await Track.create({ ...track, id }, { transaction });

    // create new artists and tags and add them to track
    const newArtistIds = await createArtists(newArtists, transaction);
    artists.concat(newArtistIds);
    await editTrackArtists(id, artists, transaction);

    const newTagIds = await createTags(newTags, transaction);
    tags.concat(newTagIds);
    await editTrackTags(id, tags, transaction);

    // return the new track object
    const newTrack = await getTrackById(id, transaction);
    await transaction.commit();
    return newTrack;
  } catch (e) {
    await transaction.rollback();
    throw e;
  }
}

/** edit an existing track */
export async function editTrack(id, trackData, newArtists, newTags) {
  const transaction = await sequelize.transaction();

  try {
    const { artists, tags, ...track } = trackData;

    // get current track data
    const currentData = await getTrackById(id, transaction);

    // if url was changed, check that new url does not exist
    if (track.url !== currentData.url) {
      const existing = await Track.findOne({
        where: { url: track.url },
        transaction,
      });
      if (existing != null) throw Error("track already exists");
    }

    // update track
    await Track.update({ ...track }, { where: { id }, transaction });

    // create new artists and tags and add them to track
    const newArtistIds = await createArtists(newArtists, transaction);
    artists.concat(newArtistIds);
    await editTrackArtists(id, artists, transaction);

    const newTagIds = await createTags(newTags, transaction);
    tags.concat(newTagIds);
    await editTrackTags(id, tags, transaction);

    // return edited track
    const newTrack = await getTrackById(id, transaction);
    await transaction.commit();
    return newTrack;
  } catch (e) {
    await transaction.rollback();
    throw e;
  }
}

/** edit the mappings from track to artists (add or remove track artists) */
async function editTrackArtists(trackId, artistIds, transaction = null) {
  // delete all existing mappings
  await TrackArtist.destroy({ where: { trackId }, transaction });

  // add new ones
  for (let artistId of artistIds) {
    await TrackArtist.create(
      { id: uuid(), artistId, trackId, main: false },
      { transaction }
    );
  }
}

/** edit the mapping from track to tags */
async function editTrackTags(trackId, tagIds, transaction = null) {
  // delete all existing mappings
  await TrackTag.destroy({ where: { trackId }, transaction });

  // add new ones
  for (let tagId of tagIds) {
    await TrackTag.create({ id: uuid(), tagId, trackId }, { transaction });
  }
}
