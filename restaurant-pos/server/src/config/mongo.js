const mongoose = require("mongoose");
const { setCloudConnected } = require("./cloudState");

let reconnectTimer = null;

const getUri = () => process.env.MONGO_URI;

const connectOnce = async () => {
  const uri = getUri();
  if (!uri) {
    setCloudConnected(false);
    console.error("MongoDB Connection Error: MONGO_URI is not set");
    return false;
  }
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    setCloudConnected(true);
    console.log("MongoDB Connected Successfully");
    return true;
  } catch (error) {
    console.error("MongoDB Connection Error:", error.message);
    setCloudConnected(false);
    console.warn("Running in local/offline mode until MongoDB is reachable.");
    return false;
  }
};

const startReconnectLoop = () => {
  if (reconnectTimer) return;
  reconnectTimer = setInterval(async () => {
    if (mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) return;
    await connectOnce();
  }, 15000);
};

const connectMongo = async () => {
  await connectOnce();
  startReconnectLoop();

  mongoose.connection.on("connected", () => {
    setCloudConnected(true);
    console.log("MongoDB reconnected");
  });

  mongoose.connection.on("disconnected", () => {
    setCloudConnected(false);
    console.warn("MongoDB disconnected. Reconnect loop active.");
  });
};

module.exports = connectMongo;
