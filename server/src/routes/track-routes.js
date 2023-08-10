import Router from "express";
import * as db from "../services/track-service";

const trackRouter = Router();

// get track by id
trackRouter.get("/id", async (req, res) => {
  try {
    const { id } = req.query;
    const track = await db.getTrackById(id);
    res.status(200).json(track);
  } catch (e) {
    console.log(e);
    res.status(404).json("not found");
  }
});

// get track by url
trackRouter.get("/url", async (req, res) => {
  try {
    const { url } = req.query;
    let track = await db.getTrackByUrl(url);
    res.status(200).json(track);
  } catch (e) {
    console.log(e);
    res.status(404).json("not found");
  }
});

// insert new track
trackRouter.post("/", async (req, res) => {
  try {
    const track = await db.add(req.body);
    res.status(200).json(track);
  } catch (e) {
    console.log(e);
    res.status(500).json("could not add");
  }
});

// edit track
trackRouter.patch("/", async (req, res) => {
  try {
    const { id, ...trackData } = req.body;
    const track = await db.edit(id, trackData);
    res.status(200).json(track);
  } catch (e) {
    console.log(e);
    res.status(500).json("could not edit");
  }
});

export { trackRouter };
