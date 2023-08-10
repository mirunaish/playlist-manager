import Router from "express";
import * as db from "../services/playlist-service.js";

const playlistRouter = Router();

// get playlist (id, title, and artist for each track)
// query contains filters
playlistRouter.get("/", async (req, res) => {
  try {
    const playlist = await db.getPlaylist(req.query);
    res.status(200).json(playlist);
  } catch (e) {
    console.log(e);
    res.status(404).json("not found");
  }
});

export { playlistRouter };
