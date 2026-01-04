import express from "express";
import { PORT } from "./config";
import { connectDatabase } from "./database/mongodb";

const app = express();

// Connect to MongoDB before starting the server
connectDatabase();

// Middlewares
app.use(express.json());

// Example route
app.get("/", (req, res) => {
  res.send("Flower Blossom Backend is running!");
});

// Start server
app.listen(PORT, () => {
  console.log(`App is running on http://localhost:${PORT}`);
});
