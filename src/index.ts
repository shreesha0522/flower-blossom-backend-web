import express, { Application } from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { PORT } from "./config";

import authRouter from "./routes/auth.route";
import { connectDatabase } from "./database/mongodb";

dotenv.config()
const app : Application= express();

app.use(bodyParser.json());

app.use('/api/auth', authRouter);

async function startServer() {
  await connectDatabase();
  app.listen(PORT, () => {
    console.log(`app is running on: http://localhost:${PORT}`)
  })
}

startServer();