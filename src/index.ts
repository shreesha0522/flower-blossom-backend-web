import { PORT } from "./config";
import { connectDatabase } from "./database/mongodb";
import app from "./app";

async function startServer() {
  try {
    // Connect to MongoDB
    await connectDatabase();

    // Listen on all network interfaces
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`✅ Server is running on: http://localhost:${PORT}`);       // ✅ FIXED: added (
      console.log(`📱 Android emulator can access at: http://10.0.2.2:${PORT}`); // ✅ FIXED: added (
      console.log(`🌐 Network access available at: http://0.0.0.0:${PORT}`);     // ✅ FIXED: added (
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

// Start the server
startServer();