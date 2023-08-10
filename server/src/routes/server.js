import Router from "express";
import * as db from "../services/database.js";

const router = Router();

// strip urls from supported sites
router.use((req, res, next) => {
  function stripURL(url) {
    if (url.includes("youtube")) {
      // remove everything after the first argument
      url = url.replace(/&.*$/, "");
    }
    return url;
  }

  if (req.body?.url) {
    req.body.url = stripURL(req.body.url);
  }
  if (req.query?.url) {
    req.query.url = stripURL(req.query.url);
  }

  next();
});

// get all artists
router.get("/artists", async (req, res) => {
  const artists = await db.getAllArtists();
  res.json(artists);
});

// get playlist (id, title, and artist for each track)
// query contains filters
router.get("/playlist", async (req, res) => {
  try {
    const playlist = await db.getPlaylist(req.query);
    res.status(200).json(playlist);
  } catch (e) {
    console.log(e);
    res.status(404).json("not found");
  }
});

// get all info about one track given id
router.get("/id", async (req, res) => {
  try {
    const { id } = req.query;
    const track = await db.getTrackById(id);
    res.status(200).json(track);
  } catch (e) {
    console.log(e);
    res.status(404).json("not found");
  }
});

// get info about track given url
router.get("/url", async (req, res) => {
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
router.post("/add", async (req, res) => {
  try {
    const track = await db.add(req.body);
    res.status(200).json(track);
  } catch (e) {
    console.log(e);
    res.status(500).json("could not add");
  }
});

// edit track
router.post("/edit", async (req, res) => {
  try {
    const { id, ...trackData } = req.body;
    const track = await db.edit(id, trackData);
    res.status(200).json(track);
  } catch (e) {
    console.log(e);
    res.status(500).json("could not edit");
  }
});

export default router;
