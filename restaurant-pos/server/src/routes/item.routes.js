const express = require("express");
const router = express.Router();

const itemController = require("../controllers/item.controller");
const { verifyToken, authorizeRoles } = require("../middleware/auth.middleware");

// Admin Only
router.post("/", verifyToken, authorizeRoles("admin"), itemController.createItem);
router.put("/:id", verifyToken, authorizeRoles("admin"), itemController.updateItem);
router.delete("/:id", verifyToken, authorizeRoles("admin"), itemController.deleteItem);

// Admin + Cashier can view
router.get("/", verifyToken, authorizeRoles("admin", "cashier"), itemController.getItems);

module.exports = router;