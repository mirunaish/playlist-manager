import { createModel } from "../database/createModel";

export const Quickplay = createModel("quickplays", {
  id: { type: "uuid", isPrimaryKey: true },
  title: { type: "string", isIndexed: true, isUnique: true },

  theme: { type: "string" },
  filters: { type: "string" }, // JSON stringified.
});
