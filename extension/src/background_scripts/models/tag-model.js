import { createModel } from "../database/createModel";

export const Tags = createModel("tags", {
  id: { type: "uuid", isPrimaryKey: true },
  name: { type: "string", isIndexed: true, isUnique: true },

  color: { type: "string" },
});
