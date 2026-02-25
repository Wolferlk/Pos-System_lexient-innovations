const Log = require("../models/Log");

const logAction = async ({
  req,
  action,
  description,
  module,
}) => {
  try {
    await Log.create({
      userId: req.user.id,
      userName: req.user.name,
      role: req.user.role,
      action,
      description,
      module,
      ipAddress: req.ip,
    });
  } catch (error) {
    console.error("Log error:", error);
  }
};

module.exports = logAction;