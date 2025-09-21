import { createModel } from "../database/dexie";

export const Tags = createModel("tags", {
  id: { type: "uuid", isPrimaryKey: true },
  name: { type: "string", isIndexed: true, isUnique: true },

  color: { type: "string" },
});
