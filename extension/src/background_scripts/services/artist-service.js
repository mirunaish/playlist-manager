import { artistRepository, trackRepository } from "../repository";

async function getTrackArtists(trackId) {
  // get the track
  const track = await trackRepository.getTrackById(trackId);

  // need to do it this way to get them in order
  const artists = await Promise.all(
    track.data.artists.map((artistId) =>
      artistRepository.getArtistById(artistId)
    )
  );

  return artists;
}

/**
 * for each name, add the id if the artist exists
 * maintain the order of the names...
 */
async function artistMatch(names) {
  const artists = [];

  // TODO could maybe do this with a map?
  for (let name of names) {
    // does the artist exist? (case insensitive)
    const id = (await artistRepository.getArtistByName(name))?.id;

    // add this artist's id or an object containing the name
    artists.push(!!id ? id : { isReal: false, name });
  }
  return artists;
}

export const artistService = {
  ...artistRepository,
  getTrackArtists,
  artistMatch,
};
