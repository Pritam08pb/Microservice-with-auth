import dotenv from "dotenv";

dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 4001,
  NODE_ENV: process.env.NODE_ENV || "development",
};