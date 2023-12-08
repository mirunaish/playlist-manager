import { sequelize, Zone } from "../../src/index.js";
import { v4 as uuid } from "uuid";

export async function getAllZones() {
  const result = await Zone.findAll({ order: [["name", "ASC"]] });

  return result;
}

export async function createZone(zoneData) {
  const id = uuid();
  await Zone.create({ ...zoneData, id });
  return id;
}
