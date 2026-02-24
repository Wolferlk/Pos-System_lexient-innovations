const mongoose = require("mongoose");

const EmployeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["Chef", "Cashier", "Manager", "Waiter"],
      required: true,
    },
    basicSalary: {
      type: Number,
      required: true,
    },
    attendanceDays: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Employee", EmployeeSchema);