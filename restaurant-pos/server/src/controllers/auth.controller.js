const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { logAction } = require("../utils/auditLogger");
const {
  DEFAULT_ADMIN_EMAIL,
  DEFAULT_ADMIN_PASSWORD,
  DEFAULT_ADMIN_NAME,
} = require("../config/bootstrapAdmin");
const JWT_SECRET = process.env.JWT_SECRET || "pos-local-fallback-secret";
const normalizeRole = (role) => String(role || "cashier").toLowerCase();

// Register (Admin only later)
exports.register = async (req, res) => {
  try {
    const mongoConnected = mongoose.connection.readyState === 1;
    if (!mongoConnected) {
      return res.status(503).json({
        message: "Cloud database unavailable. Registration is available only when online.",
      });
    }

    const { name, email, password, role } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: normalizeRole(role),
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
    const mongoConnected = mongoose.connection.readyState === 1;

    let user = null;
    if (mongoConnected) {
      user = await User.findOne({ email });
    }

    // Emergency local login path when cloud DB is unavailable.
    if (!mongoConnected && email === DEFAULT_ADMIN_EMAIL && password === DEFAULT_ADMIN_PASSWORD) {
      const token = jwt.sign(
        { id: "offline-admin", role: "admin", name: DEFAULT_ADMIN_NAME },
        JWT_SECRET,
        { expiresIn: "1d" }
      );

      await logAction({
        req,
        action: "LOGIN",
        task: "Login",
        module: "Auth",
        description: `Offline admin login (${DEFAULT_ADMIN_EMAIL})`,
        payload: { offlineMode: true },
        userOverride: { id: "offline-admin", name: DEFAULT_ADMIN_NAME, role: "admin" },
      });

      return res.json({
        message: "Offline login successful",
        token,
        user: {
          name: DEFAULT_ADMIN_NAME,
          role: "admin",
        },
        offline: true,
      });
    }

    if (!mongoConnected) {
      return res.status(503).json({
        message:
          `Cloud database unavailable. Use emergency login: ${DEFAULT_ADMIN_EMAIL}`,
      });
    }

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

    if (user.isActive === false) {
      await logAction({
        req,
        action: "LOGIN",
        task: "Login",
        module: "Auth",
        status: "FAILED",
        description: `Login blocked for ${email}: account disabled`,
        entityType: "User",
        entityId: user._id,
      });
      return res.status(403).json({ message: "User account is disabled" });
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
      { id: user._id, role: normalizeRole(user.role), name: user.name },
      JWT_SECRET,
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
        email: user.email,
        role: normalizeRole(user.role),
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

// Get current user
exports.getMe = async (req, res) => {
  try {
    const mongoConnected = mongoose.connection.readyState === 1;
    
    // For offline admin login
    if (req.user?.id === "offline-admin") {
      return res.json({
        name: req.user.name || "Admin",
        email: DEFAULT_ADMIN_EMAIL,
        role: req.user.role || "admin",
      });
    }

    if (!mongoConnected) {
      return res.status(503).json({ message: "Cloud database unavailable" });
    }

    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      name: user.name,
      email: user.email,
      role: normalizeRole(user.role),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

