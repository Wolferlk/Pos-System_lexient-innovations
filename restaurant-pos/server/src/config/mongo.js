const mongoose = require("mongoose");
const { setCloudConnected } = require("./cloudState");

const connectMongo = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    setCloudConnected(true);
    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.error("MongoDB Connection Error:", error.message);
    setCloudConnected(false);
    console.warn("Running in local/offline mode until MongoDB is reachable.");
  }

  mongoose.connection.on("connected", () => {
    setCloudConnected(true);
  });

  mongoose.connection.on("disconnected", () => {
    setCloudConnected(false);
  });
};

module.exports = connectMongo;
