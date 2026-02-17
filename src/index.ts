import { PORT } from "./config";
import { connectDatabase } from "./database/mongodb";
import app from "./app";

async function startServer() {
  try {
    await connectDatabase();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server is running on: http://localhost:${PORT}`);
      console.log(`Android emulator can access at: http://10.0.2.2:${PORT}`);
      console.log(`Network access available at: http://0.0.0.0:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

startServer();
