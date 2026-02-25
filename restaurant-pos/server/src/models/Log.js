const mongoose = require("mongoose");

const LogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    userName: String,
    role: String,

    action: {
      type: String,
      required: true,
      index: true,
    },

    task: {
      type: String,
      index: true,
    },

    description: String,

    module: {
      type: String,
      index: true,
    }, // Orders / Items / Users / Expenses etc

    status: {
      type: String,
      enum: ["SUCCESS", "FAILED"],
      default: "SUCCESS",
      index: true,
    },

    entityType: String,
    entityId: String,
    payload: mongoose.Schema.Types.Mixed,

    ipAddress: String,
    userAgent: String,

    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { versionKey: false }
);

LogSchema.index({ createdAt: -1, userId: 1, action: 1 });

module.exports = mongoose.model("Log", LogSchema);
