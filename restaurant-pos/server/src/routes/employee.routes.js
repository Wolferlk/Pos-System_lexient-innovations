const express = require("express");
const router = express.Router();

const employeeController = require("../controllers/employee.controller");
const { verifyToken, authorizeRoles } = require("../middleware/auth.middleware");

router.post("/", verifyToken, authorizeRoles("admin"), employeeController.createEmployee);
router.get("/", verifyToken, authorizeRoles("admin"), employeeController.getEmployees);
router.put("/:id", verifyToken, authorizeRoles("admin"), employeeController.updateAttendance);

module.exports = router;