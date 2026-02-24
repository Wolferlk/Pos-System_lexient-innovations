const express = require("express");
const router = express.Router();

const inventoryController = require("../controllers/inventory.controller");
const { verifyToken, authorizeRoles } = require("../middleware/auth.middleware");

// Admin only
router.post("/", verifyToken, authorizeRoles("admin"), inventoryController.createInventory);
router.get("/", verifyToken, authorizeRoles("admin"), inventoryController.getInventory);
router.put("/:id", verifyToken, authorizeRoles("admin"), inventoryController.updateInventory);
router.get("/low-stock", verifyToken, authorizeRoles("admin"), inventoryController.getLowStock);

module.exports = router;