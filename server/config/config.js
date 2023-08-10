import dotenv from "dotenv";

dotenv.config();

export default {
  development: {
    url: process.env.DATABASE_URL,
    dialect: "postgres",
    logging: true,
  },
  test: {
    url: process.env.DATABASE_URL,
    dialect: "postgres",
    logging: true,
  },
  production: {
    url: process.env.DATABASE_URL,
    dialect: "postgres",
    logging: true,
  },
};
