import express from "express";
import { connectDatabase } from "./database/mongodb";
import authRoutes from "./routes/auth.route";

const app = express();

// MongoDB connection
connectDatabase();

// JSON parser
app.use(express.json());

// Register routes
app.use("/api/auth", authRoutes);

// Default route
app.get("/", (req, res) => res.send("🌸 Flower Blossom Backend is running!"));

// Use host port or fallback to 3000
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
