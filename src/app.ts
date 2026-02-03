import express, { Application } from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import authRouter from "./routes/auth.route";
import uploadRouter from "./routes/upload.route";
import profileRouter from "./routes/profile.route";
import adminRouter from "./routes/admin.route";

dotenv.config();

const app: Application = express();

// ✅ CORS options
const corsOptions = {
  origin: ["http://localhost:3000", "http://localhost:3005", "http://localhost:8000"]
};
app.use(cors(corsOptions));

// ✅ Logger
app.use(morgan("dev"));

// ✅ JSON parser
app.use(bodyParser.json());

// ✅ Serve uploaded images as static files
app.use("/uploads", express.static("uploads"));

// ✅ Routes
app.use("/api/auth", authRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/profile", profileRouter);
app.use("/api/admin", adminRouter);

// ✅ Export the app (don't start server here)
export default app;