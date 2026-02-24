const express = require("express");
const router = express.Router();

const reportController = require("../controllers/report.controller");
const { verifyToken, authorizeRoles } = require("../middleware/auth.middleware");

// Admin Only
router.get("/daily", verifyToken, authorizeRoles("admin"), reportController.getDailyReport);
router.get("/monthly", verifyToken, authorizeRoles("admin"), reportController.getMonthlyReport);
router.get("/chart", verifyToken, authorizeRoles("admin"), reportController.getSalesChart);

module.exports = router;