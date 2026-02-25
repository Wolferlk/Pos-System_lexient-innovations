const express = require("express");
const router = express.Router();

const offlineController = require("../controllers/offline.controller");
const { verifyToken, authorizeRoles } = require("../middleware/auth.middleware");

router.get("/status", verifyToken, authorizeRoles("admin", "cashier"), offlineController.status);
router.get("/pending-orders", verifyToken, authorizeRoles("admin", "cashier"), offlineController.getPendingOrders);
router.post("/queue-order", verifyToken, authorizeRoles("admin", "cashier"), offlineController.queueOrder);
router.post("/sync", verifyToken, authorizeRoles("admin", "cashier"), offlineController.syncPending);

module.exports = router;
