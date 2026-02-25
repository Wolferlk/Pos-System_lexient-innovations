const express = require("express");
const router = express.Router();

const employeeController = require("../controllers/employee.controller");
const { verifyToken, authorizeRoles } = require("../middleware/auth.middleware");

router.post("/", verifyToken, authorizeRoles("admin"), employeeController.createEmployee);
router.get("/", verifyToken, authorizeRoles("admin", "cashier"), employeeController.getEmployees);
router.get("/payroll", verifyToken, authorizeRoles("admin"), employeeController.getMonthlyPayroll);
router.get("/attendance/summary", verifyToken, authorizeRoles("admin"), employeeController.getAttendanceSummary);
router.put("/:id", verifyToken, authorizeRoles("admin"), employeeController.updateEmployee);
router.put("/:id/attendance", verifyToken, authorizeRoles("admin"), employeeController.updateAttendance);
router.post("/:id/attendance/mark", verifyToken, authorizeRoles("admin", "cashier"), employeeController.markDailyAttendance);
router.put("/:id/attendance/day", verifyToken, authorizeRoles("admin"), employeeController.updateDailyAttendance);

module.exports = router;
