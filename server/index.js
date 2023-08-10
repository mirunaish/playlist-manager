import express from "express";
import bodyParser from "body-parser";
import morgan from "morgan";
import cors from "cors";
import { Sequelize, DataTypes } from "sequelize";
import dotenv from "dotenv";
import router from "./src/routes/server";
import { defTrack, defArtist, defAuthorship } from "./src/models";

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

app.use(bodyParser.json());
app.use(morgan("dev"));
app.use(cors());

// add routes
app.use("/", router);

// start app
app.listen(5000, () => {
  console.log(`Server is running on port 5000.`);
});
