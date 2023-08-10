import express from "express";
import bodyParser from "body-parser";
import morgan from "morgan";
import cors from "cors";
import { Sequelize, DataTypes } from "sequelize";
import dotenv from "dotenv";
import * as routers from "./src/routes";
import { defTrack, defArtist, defAuthorship } from "./src/models";
import { stripUrls } from "./src/middleware";

// config environment variables
dotenv.config();

// connect to database
export const sequelize = new Sequelize(process.env.DATABASE_URL); // , { logging: false }

// define + export models
export const Track = defTrack(sequelize, DataTypes);
export const Artist = defArtist(sequelize, DataTypes);
export const Authorship = defAuthorship(sequelize, DataTypes);

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
app.use("/track", routers.trackRouter);

// start app
app.listen(5000, () => {
  console.log(`Server is running on port 5000.`);
});
