import * as db from "./database.js";

import express from "express";
import bodyParser from "body-parser";
import morgan from "morgan";
import cors from "cors";

const app = express();

app.use(bodyParser.json());
app.use(morgan("dev"));
app.use(cors());

// strip urls from supported sites
app.use((req, res, next) => {
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
app.get("/artists", async (req, res) => {
  const artists = await db.getAllArtists();
  res.json(artists);
});

// get playlist (id, title, and artist for each track)
// query contains filters
app.get("/playlist", async (req, res) => {
  try {
    const playlist = await db.getPlaylist(req.query);
    res.status(200).json(playlist);
  } catch (e) {
    console.log(e);
    res.status(404).json("not found");
  }
});

// get all info about one track given id
app.get("/id", async (req, res) => {
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
app.get("/url", async (req, res) => {
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
app.post("/add", async (req, res) => {
  try {
    const track = await db.add(req.body);
    res.status(200).json(track);
  } catch (e) {
    console.log(e);
    res.status(500).json("could not add");
  }
});

// edit track
app.post("/edit", async (req, res) => {
  try {
    const { id, ...trackData } = req.body;
    const track = await db.edit(id, trackData);
    res.status(200).json(track);
  } catch (e) {
    console.log(e);
    res.status(500).json("could not edit");
  }
});

app.listen(5000, () => {
  console.log(`Server is running on port 5000.`);
});
