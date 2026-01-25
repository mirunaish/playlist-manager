import { createModel } from "../database/createModel";

export const Tracks = createModel("tracks", {
  id: { type: "uuid", isPrimaryKey: true },
  url: { type: "string", isIndexed: true, isUnique: true },
  title: { type: "string", isIndexed: true },
  rating: { type: "number", isIndexed: true },

  tags: { type: "uuid", isIndexed: true, isArray: true },
  artists: { type: "uuid", isIndexed: true, isArray: true },

  duration: { type: "number", isIndexed: true },
  imageLink: { type: "string" },

  addedAt: { type: "datetime", isIndexed: true },
  lastPlayedAt: { type: "datetime", isIndexed: true },
  plays: { type: "number", isIndexed: true },
  skips: { type: "number", isIndexed: true },
});
