import Router from "express";
import * as db from "../services/zone-service.js";

const zoneRouter = Router();

// get all zones
zoneRouter.get("/", async (req, res) => {
  const zones = await db.getAllZones(req.query);
  res.json(zones);
});

// create a new zone
zoneRouter.post("/", async (req, res) => {
  try {
    const zoneId = await db.createZone(req.body);
    res.status(201).json(zoneId);
  } catch (e) {
    console.log(e);
    res.status(500).send("could not add");
  }
});

export { zoneRouter };
