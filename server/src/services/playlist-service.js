import { sequelize, Track, Artist, TrackArtist } from "../../src/index.js";

// filter + sort tracks
export async function getPlaylist(filters) {
  // build query
  const where = [];

  // add rating filters
  if (filters.rating != null) {
    if (filters.rating === "3+") {
      where.push("rating IN ('3', '4', '5')");
    } else {
      where.push("rating='" + s(filters.rating) + "'");
    }
  }

  // add artist filters
  if (filters.artist != null) {
    if (filters.artist === "not star") {
      // get list of non-starred artists
      // todo fix this
      let inquiry = "SELECT id FROM artists WHERE";
      inquiry += "(SELECT COUNT(*) FROM authorships WHERE artist=artists.id)<3";
      let notStar = await select(inquiry);

      let clause = "artists.id IN (none";
      notStar.forEach((artist) => {
        clause += ", '" + artist + "'";
      });
      clause += ")";
      where.push(clause);
    } else {
      where.push("artists.id='" + filters.artist + "'");
    }
  }

  let inquiry = "SELECT tracks.id, tracks.title FROM tracks";
  if (filters.artist != null) {
    inquiry += " JOIN authorships ON tracks.id=authorships.track";
    inquiry += " JOIN artists ON authorships.artist=artists.id";
  }
  if (where.length > 0) {
    inquiry += " WHERE ";
    for (let i = 0; i < where.length - 1; i++) {
      inquiry += where[i] + " AND ";
    }
    inquiry += where[where.length - 1];
  }

  // get playlist with filters
  let playlist = await select(inquiry);

  if (playlist.length == 0) {
    throw "found no tracks matching these filters";
  }

  // TODO simplify this?
  // get artists for each track
  for (let i = 0; i < playlist.length; i++) {
    playlist[i].artist = await getTrackArtists(playlist[i].id);
  }

  // sort
  if (filters["sort"] === "shuffle") {
    // shuffle the playlist
    for (let i = 0; i < playlist.length - 1; i++) {
      // pick random track and move it to the front
      let j = Math.floor(i + Math.random() * (playlist.length - i));
      // swap
      [playlist[i], playlist[j]] = [playlist[j], playlist[i]];
    }
  }

  return playlist;
}
