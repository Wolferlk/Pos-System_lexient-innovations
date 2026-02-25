const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "pos-local-fallback-secret";

exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader)
    return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // contains id + role
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// Role check middleware
exports.authorizeRoles = (...roles) => {
  const normalized = roles.map((r) => String(r).toLowerCase());
  return (req, res, next) => {
    const role = String(req.user?.role || "").toLowerCase();
    if (!normalized.includes(role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};
