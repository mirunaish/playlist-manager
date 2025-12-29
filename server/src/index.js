import express from "express";
import bodyParser from "body-parser";
import morgan from "morgan";
import cors from "cors";
import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import * as routers from "./routes/index.js";
import * as define from "./models.js";
import { stripUrls } from "./middleware.js";
import { exportEverything } from "./services/playlist-service.js";

// config environment variables
dotenv.config();

// connect to database
export const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
});

try {
  await sequelize.authenticate();
  console.log("connected to database");
} catch (e) {
  console.error("could not connect to database:", e);
}

// define + export models
export const Artist = define.artist(sequelize);
export const Tag = define.tag(sequelize);
export const Track = define.track(sequelize);
export const TrackArtist = define.trackArtist(sequelize);
export const TrackTag = define.trackTag(sequelize);
define.associations(sequelize);

// create express app
const app = express();
app.use(bodyParser.json()); // parse request body as json
app.use(morgan("dev")); // log all requests
app.use(cors()); // cross origin resource sharing

// add middleware
app.use(stripUrls);

// add routes
app.use("/artists", routers.artistRouter);
app.use("/playlist", routers.playlistRouter);
app.use("/tags", routers.tagRouter);
app.use("/tracks", routers.trackRouter);

app.use("/export", exportEverything);

// add 404 route for all requests not caught by one of the above ^
app.use((req, res, next) => {
  res.status(404).json({ error: "invalid request url" });
});

// start app
app.listen(5000, () => {
  console.log(`Server is running on port 5000.`);
});
