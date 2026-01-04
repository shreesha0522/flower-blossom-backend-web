import mongoose from "mongoose";
import { MONGODB_URI } from "../config";

export const connectDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1); // Stop server if DB fails
  }
};
