const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { logAction } = require("../utils/auditLogger");

// Register (Admin only later)
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    await logAction({
      req,
      action: "CREATE_USER",
      task: "Register user",
      module: "Users",
      description: `User ${user.email} registered`,
      entityType: "User",
      entityId: user._id,
      userOverride: { name: name || "System", role: role || "system" },
    });

    res.status(201).json({
      message: "User created successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      await logAction({
        req,
        action: "LOGIN",
        task: "Login",
        module: "Auth",
        status: "FAILED",
        description: `Login failed for ${email}: user not found`,
        payload: { email },
      });
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await logAction({
        req,
        action: "LOGIN",
        task: "Login",
        module: "Auth",
        status: "FAILED",
        description: `Login failed for ${email}: invalid credentials`,
        entityType: "User",
        entityId: user._id,
      });
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    await logAction({
      req,
      action: "LOGIN",
      task: "Login",
      module: "Auth",
      description: `User ${user.email} logged in`,
      entityType: "User",
      entityId: user._id,
      userOverride: { id: user._id, name: user.name, role: user.role },
    });

    res.json({
      message: "Login successful",
      token,
      user: {
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.logout = async (req, res) => {
  try {
    await logAction({
      req,
      action: "LOGOUT",
      task: "Logout",
      module: "Auth",
      description: `User ${req.user?.name || req.user?.id || "Unknown"} logged out`,
      entityType: "User",
      entityId: req.user?.id,
    });

    res.json({ message: "Logout logged" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

