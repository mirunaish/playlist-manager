import { createModel } from "../database/dexie";

export const Artists = createModel("artists", {
  id: { type: "uuid", isPrimaryKey: true },
  name: { type: "string", isIndexed: true, isUnique: true },
  starred: { type: "boolean", isIndexed: true },
});
