import express, { Application } from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { connectDatabase } from "./database/mongodb";
import authRoute from "./routes/auth.route"; // Import name is authRoute

dotenv.config();

const app: Application = express();

// ================= MIDDLEWARE =================
// CORS - Allow requests from Next.js frontend
const corsOptions = {
  origin: ["http://localhost:3000", "http://localhost:3001"],
  credentials: true, // Important for cookies!
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(morgan("dev"));
app.use(express.json());

// ================= ROUTES =================
app.use("/api/auth", authRoute); // FIXED: Changed authRoutes to authRoute

// Health check
app.get("/", (_req, res) => {
  res.status(200).send("🌸 Flower Blossom Backend is running!");
});

// ================= SERVER STARTUP =================
const PORT = process.env.PORT || 5001;

async function startServer() {
  try {
    await connectDatabase();
    console.log("✅ Database connected successfully");
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();