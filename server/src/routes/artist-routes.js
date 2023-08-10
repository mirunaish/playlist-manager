import Router from "express";
import * as db from "../services/artist-service";

const artistRouter = Router();

// get all artists
artistRouter.get("/", async (req, res) => {
  const artists = await db.getAllArtists();
  res.json(artists);
});

export { artistRouter };
