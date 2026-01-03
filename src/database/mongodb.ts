import mongoose from "mongoose";
import {MONGODB_URI} from "../config/index";

// Info: Function to connect to database
export async function connectDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to Database", MONGODB_URI);
  } catch (error) {
    console.error("Database error: ", error);
    process.exit(1);
  }
}