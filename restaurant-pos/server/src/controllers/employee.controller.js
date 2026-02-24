const Employee = require("../models/Employee");

// Create employee
exports.createEmployee = async (req, res) => {
  try {
    const employee = await Employee.create(req.body);
    res.status(201).json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all employees
exports.getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update attendance
exports.updateAttendance = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { attendanceDays: req.body.attendanceDays },
      { new: true }
    );
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};