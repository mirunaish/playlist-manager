import { v4 as uuid } from "uuid";
import { db } from "./database";

export async function getAllArtists() {
  try {
    return await db.artists.orderBy("name").toArray();
  } catch (e) {
    console.error("database error:", e);
    throw Error("Failed to get artists: " + e.message);
  }
}

export async function getArtistById(id) {
  try {
    const artist = await db.artists.get(id);
    if (artist === null) throw Error("Artist does not exist.");
    return artist;
  } catch (e) {
    console.error("database error:", e);
    throw Error("Could not get artist: " + e.message);
  }
}

// currently unused
// might change this to a function that takes as input an array of names
// and returns an object with keys names and values either an id if it exists or null if it doesn't
// export async function artistMatch(string) {
//   // return array of ids given string of names
//   // if no matches, create new artist and return id
//   const ids = [];
//   const names = string.split(",").map((s) => s.trim());

//   for (let name of names) {
//     // does the artist exist? (case insensitive)
//     let id = (
//       await Artist.findOne({
//         where: { name: { [Op.iLike]: name } },
//       })
//     )?.id;

//     // if not, create them
//     // if (!id) id = (await createArtist({ name })).id;

//     // add this artist's id
//     ids.push(id);
//   }
//   return ids;
// }

export async function createArtist(artistData) {
  try {
    const id = uuid();
    if (!artistData.starred) artistData.starred = false;

    return await db.transaction("rw", db.artists, async () => {
      await db.artists.add({ ...artistData, id });
      const newArtist = await getArtistById(id);
      return newArtist;
    });
  } catch (e) {
    console.error("database error:", e);
    throw Error("Failed to create artist: " + e.message);
  }
}
