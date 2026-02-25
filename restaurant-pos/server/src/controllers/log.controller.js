const Log = require("../models/Log");

const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfDay = (date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

exports.getLogs = async (req, res) => {
  try {
    const {
      date,
      userId,
      userName,
      action,
      task,
      module,
      status,
      startDate,
      endDate,
      page = 1,
      limit = 100,
    } = req.query;

    const query = {};

    if (userId) query.userId = userId;
    if (userName) query.userName = new RegExp(userName, "i");
    if (action) query.action = action;
    if (task) query.task = task;
    if (module) query.module = module;
    if (status) query.status = status;

    if (date) {
      query.createdAt = {
        $gte: startOfDay(date),
        $lte: endOfDay(date),
      };
    } else if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = endOfDay(endDate);
    }

    const safeLimit = Math.min(Number(limit) || 100, 500);
    const safePage = Math.max(Number(page) || 1, 1);
    const skip = (safePage - 1) * safeLimit;

    const [logs, total] = await Promise.all([
      Log.find(query).sort({ createdAt: -1 }).skip(skip).limit(safeLimit),
      Log.countDocuments(query),
    ]);

    res.json({
      total,
      page: safePage,
      limit: safeLimit,
      logs,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getLogFilters = async (_req, res) => {
  try {
    const [users, actions, tasks, modules] = await Promise.all([
      Log.distinct("userName"),
      Log.distinct("action"),
      Log.distinct("task"),
      Log.distinct("module"),
    ]);

    res.json({
      users: users.filter(Boolean).sort(),
      actions: actions.filter(Boolean).sort(),
      tasks: tasks.filter(Boolean).sort(),
      modules: modules.filter(Boolean).sort(),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
