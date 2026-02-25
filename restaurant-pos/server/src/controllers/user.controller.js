const User = require("../models/User");
const bcrypt = require("bcrypt");
const { logAction } = require("../utils/auditLogger");

// Get all users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user (name / role)
exports.updateUser = async (req, res) => {
  try {
    const before = await User.findById(req.params.id).select("-password");
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    await logAction({
      req,
      action: "EDIT_USER",
      task: "Edit user",
      module: "Users",
      description: `User ${user.email} updated`,
      entityType: "User",
      entityId: user._id,
      payload: { before, after: user },
    });

    res.json(user);
  } catch (error) {
    await logAction({
      req,
      action: "EDIT_USER",
      task: "Edit user",
      module: "Users",
      status: "FAILED",
      description: "Update user failed",
      payload: { message: error.message, userId: req.params.id },
    });
    res.status(500).json({ message: error.message });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    const hashed = await bcrypt.hash(req.body.password, 10);
    const user = await User.findByIdAndUpdate(req.params.id, {
      password: hashed,
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    await logAction({
      req,
      action: "RESET_PASSWORD",
      task: "Reset password",
      module: "Users",
      description: `Password reset for ${user.email}`,
      entityType: "User",
      entityId: user._id,
    });

    res.json({ message: "Password updated" });
  } catch (error) {
    await logAction({
      req,
      action: "RESET_PASSWORD",
      task: "Reset password",
      module: "Users",
      status: "FAILED",
      description: "Reset password failed",
      payload: { message: error.message, userId: req.params.id },
    });
    res.status(500).json({ message: error.message });
  }
};

// Terminate user
exports.terminateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, {
      isActive: false,
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    await logAction({
      req,
      action: "TERMINATE_USER",
      task: "Terminate user",
      module: "Users",
      description: `User ${user.email} terminated`,
      entityType: "User",
      entityId: user._id,
    });

    res.json({ message: "User terminated" });
  } catch (error) {
    await logAction({
      req,
      action: "TERMINATE_USER",
      task: "Terminate user",
      module: "Users",
      status: "FAILED",
      description: "Terminate user failed",
      payload: { message: error.message, userId: req.params.id },
    });
    res.status(500).json({ message: error.message });
  }
};
