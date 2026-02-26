const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT_EXCEPTION:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED_REJECTION:", err);
});

const app = require("./src/app");
const connectMongo = require("./src/config/mongo");
const { ensureDefaultAdmin } = require("./src/config/bootstrapAdmin");

const PORT = process.env.PORT || 5000;
let server;

const startBackgroundInit = async () => {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await connectMongo();
    console.log("✅ MongoDB init completed");
  } catch (error) {
    // Never crash backend startup because cloud DB is unavailable.
    console.warn("⚠ Mongo init failed. Running in offline/local mode:", error.message);
  }

  try {
    await ensureDefaultAdmin();
    console.log("✅ Default admin ensured");
  } catch (error) {
    console.warn("⚠ Default admin bootstrap skipped:", error.message);
  }
};

const startServer = () => {
  // Start HTTP API immediately so Electron can continue startup even if Mongo is slow/offline.
  server = app.listen(PORT, "127.0.0.1", () => {
    console.log(`SERVER_READY:${PORT}`);
    console.log(`🚀 Server running at http://127.0.0.1:${PORT}`);
    startBackgroundInit();
  });

  server.on("error", (err) => {
    console.error("SERVER_ERROR:", err);
    process.exit(1);
  });
};

startServer();

/**
 * Graceful shutdown (important for POS apps)
 */
const shutdown = async () => {
  console.log("🛑 Shutting down server...");
  if (server) {
    server.close(() => {
      console.log("✅ Server closed");
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};



process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
