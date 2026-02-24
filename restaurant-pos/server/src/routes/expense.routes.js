const express = require("express");
const router = express.Router();

const expenseController = require("../controllers/expense.controller");
const { verifyToken, authorizeRoles } = require("../middleware/auth.middleware");

router.post("/", verifyToken, authorizeRoles("admin"), expenseController.createExpense);
router.get("/", verifyToken, authorizeRoles("admin"), expenseController.getExpenses);
router.delete("/:id", verifyToken, authorizeRoles("admin"), expenseController.deleteExpense);

module.exports = router;