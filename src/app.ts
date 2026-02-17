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

const corsOptions = {
  origin: ["http://localhost:3000", "http://localhost:3005", "http://localhost:8000"],
  credentials: true
};
app.use(cors(corsOptions));
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use("/uploads", express.static("uploads"));

app.use("/api/auth", authRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/profile", profileRouter);
app.use("/api/admin", adminRouter);

export default app;
