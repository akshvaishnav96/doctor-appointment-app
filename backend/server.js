// server.js

import dotenv from "dotenv";
import app from "./app/app.js";
import { connectDB } from "./config/db.js";
import mongoose from "mongoose";

dotenv.config();

const port = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(port, () => {
      console.log(`🚀 Server running on http://localhost:${port}`);
    });

    // Graceful shutdown on Ctrl+C
    process.on("SIGINT", async () => {
      console.log("\n🛑 SIGINT received. Closing MongoDB...");
      await mongoose.connection.close();
      server.close(() => {
        console.log("✅ MongoDB disconnected. Server closed.");
        process.exit(0);
      });
    });

  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
};

startServer();
