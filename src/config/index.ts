import dotenv from "dotenv";

dotenv.config();

// Application level constants
export const PORT: number = process.env.PORT
  ? parseInt(process.env.PORT)
  : 3000;

export const MONGODB_URI: string =
  process.env.MONGODB_URI || "mongodb://localhost:27017/flower_blossom_db";

export const JWT_SECRET: string =
  process.env.JWT_SECRET || "secret_key";
