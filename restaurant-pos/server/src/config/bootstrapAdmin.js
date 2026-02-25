const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const User = require("../models/User");

const DEFAULT_ADMIN_NAME = process.env.DEFAULT_ADMIN_NAME || "System Admin";
const DEFAULT_ADMIN_EMAIL = process.env.DEFAULT_ADMIN_EMAIL || "admin@pos.local";
const DEFAULT_ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD || "admin123";

const ensureDefaultAdmin = async () => {
  if (mongoose.connection.readyState !== 1) {
    return { ensured: false, reason: "mongo-not-connected" };
  }

  const existing = await User.findOne({ email: DEFAULT_ADMIN_EMAIL });
  if (existing) {
    return { ensured: false, reason: "already-exists", email: DEFAULT_ADMIN_EMAIL };
  }

  const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);
  await User.create({
    name: DEFAULT_ADMIN_NAME,
    email: DEFAULT_ADMIN_EMAIL,
    password: hashedPassword,
    role: "admin",
    isActive: true,
  });

  console.log(`Default admin ensured: ${DEFAULT_ADMIN_EMAIL}`);
  return { ensured: true, email: DEFAULT_ADMIN_EMAIL };
};

module.exports = {
  ensureDefaultAdmin,
  DEFAULT_ADMIN_EMAIL,
  DEFAULT_ADMIN_PASSWORD,
  DEFAULT_ADMIN_NAME,
};

