const Log = require("../models/Log");

const getIp = (req) => {
  const xff = req.headers["x-forwarded-for"];
  if (Array.isArray(xff) && xff.length > 0) return xff[0];
  if (typeof xff === "string" && xff.length > 0) return xff.split(",")[0].trim();
  return req.ip || req.socket?.remoteAddress || null;
};

const logAction = async ({
  req,
  action,
  task,
  module,
  description,
  status = "SUCCESS",
  entityType,
  entityId,
  payload,
  userOverride,
}) => {
  try {
    const user = userOverride || {};
    await Log.create({
      userId: req?.user?.id || user.id || null,
      userName: req?.user?.name || user.name || "System",
      role: req?.user?.role || user.role || "system",
      action,
      task: task || action,
      module,
      description,
      status,
      entityType,
      entityId: entityId ? String(entityId) : undefined,
      payload,
      ipAddress: req ? getIp(req) : null,
      userAgent: req?.headers?.["user-agent"] || null,
    });
  } catch (error) {
    console.error("Audit log error:", error.message);
  }
};

module.exports = { logAction };
