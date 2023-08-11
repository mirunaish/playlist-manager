import express from "express";
import bodyParser from "body-parser";
import morgan from "morgan";
import cors from "cors";
import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import * as routers from "./routes/index.js";
import * as define from "./models.js";
import { stripUrls } from "./middleware.js";

// config environment variables
dotenv.config();

// connect to database
export const sequelize = new Sequelize(process.env.DATABASE_URL); // , { logging: false }

// define + export models
export const Zone = define.zone(sequelize);
export const Artist = define.artist(sequelize);
export const Tag = define.tag(sequelize);
export const Track = define.track(sequelize);
export const TrackArtist = define.trackArtist(sequelize);
export const TrackTag = define.trackTag(sequelize);

try {
  await sequelize.authenticate();
  console.log("connected to database");
} catch (e) {
  console.error("could not connect to database:", e);
}

// create express app
const app = express();
app.use(bodyParser.json()); // parse request body as json
app.use(morgan("dev")); // log all requests
app.use(cors()); // cross origin resource sharing

// add middleware
app.use(stripUrls);

// add routes
app.use("/artist", routers.artistRouter);
app.use("/playlist", routers.playlistRouter);
app.use("/tag", routers.tagRouter);
app.use("/track", routers.trackRouter);
app.use("/zone", routers.zoneRouter);

// start app
app.listen(5000, () => {
  console.log(`Server is running on port 5000.`);
});
