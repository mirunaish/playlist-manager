import Dexie from "dexie";

export const db = new Dexie("playlists");

// all the props defined here are indexed
db.version(4).stores({
  tracks: "id, &url, title, rating, *tags, *artists", // also has: duration, imageLink. tags and artists are arrays
  artists: "id, name, starred",
  tags: "id, &name", // also has: color
  quickplays: "id, &title", // also has: theme, filters
});

db.open().catch((e) => console.error("failed to open indexed db:", e));
