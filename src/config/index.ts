import dotenv from "dotenv";

dotenv.config();


// Info: Application level constant, with fallbacks
// Info: if .env variables are not set
export const PORT: number = process.env.PORT ? parseInt(process.env.PORT) : 5000; 
export const MONGODB_URI: string = process.env.MONGODB_URI || "mongodb://localhost:27017/local-fashion-store_db";
export const JWT_SECRET:string = process.env.JWT_SECRET || "secret_key";