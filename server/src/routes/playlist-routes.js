import Router from "express";
import * as db from "../services/playlist-service.js";

const playlistRouter = Router();

// get playlist (id, title, artist, duration for each track)
// plus playlist stats (?)
// query contains filters
// post so i can use body for filters
playlistRouter.post("/", async (req, res) => {
  try {
    const playlist = await db.getPlaylist(req.body);
    res.status(200).json(playlist);
  } catch (e) {
    console.log(e);
    res.status(404).json("not found");
  }
});

export { playlistRouter };
