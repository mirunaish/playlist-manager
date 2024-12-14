import Router from "express";
import * as db from "../services/artist-service.js";

const artistRouter = Router();

// get all artists
artistRouter.get("/", async (req, res) => {
  const artists = await db.getAllArtists();
  res.json(artists);
});

// create artist
artistRouter.post("/", async (req, res) => {
  try {
    const artist = await db.createArtist(req.body);
    res.json({ artist });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: e.message });
  }
});

export { artistRouter };
