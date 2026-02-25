const express = require("express");
const router = express.Router();

const orderController = require("../controllers/order.controller");
const { verifyToken, authorizeRoles } = require("../middleware/auth.middleware");

// Cashier + Admin can create orders
router.post("/", verifyToken, authorizeRoles("admin", "cashier"), orderController.createOrder);

// Admin only can view all orders
router.get("/", verifyToken, authorizeRoles("admin"), orderController.getOrders);
router.delete("/:id", verifyToken, authorizeRoles("admin"), orderController.deleteOrder);

module.exports = router;
