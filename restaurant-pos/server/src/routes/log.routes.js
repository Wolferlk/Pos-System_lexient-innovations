const express = require("express");
const router = express.Router();

const logController = require("../controllers/log.controller");
const { verifyToken, authorizeRoles } = require("../middleware/auth.middleware");

router.get("/", verifyToken, authorizeRoles("admin"), logController.getLogs);
router.get("/filters", verifyToken, authorizeRoles("admin"), logController.getLogFilters);

module.exports = router;
