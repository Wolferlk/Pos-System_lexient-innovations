const express = require("express");
const router = express.Router();

const customerController = require("../controllers/customer.controller");
const { verifyToken, authorizeRoles } = require("../middleware/auth.middleware");

router.post("/", verifyToken, authorizeRoles("admin"), customerController.createCustomer);
router.get("/", verifyToken, authorizeRoles("admin"), customerController.getAllCustomers);
router.put("/:id", verifyToken, authorizeRoles("admin"), customerController.updateCustomer);
router.delete("/:id", verifyToken, authorizeRoles("admin"), customerController.deleteCustomer);
router.get("/:phone", verifyToken, authorizeRoles("admin", "cashier"), customerController.getCustomerByPhone);

module.exports = router;