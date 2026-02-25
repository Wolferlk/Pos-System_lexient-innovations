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
    contactNumber: {
      type: String,
      default: "",
    },
    joinedDate: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    attendanceDays: {
      type: Number,
      default: 0,
    },
    attendanceByMonth: [
      {
        monthKey: {
          type: String, // YYYY-MM
          required: true,
        },
        attendanceDays: {
          type: Number,
          default: 0,
        },
        overtimeHours: {
          type: Number,
          default: 0,
        },
        allowance: {
          type: Number,
          default: 0,
        },
        deduction: {
          type: Number,
          default: 0,
        },
        note: {
          type: String,
          default: "",
        },
        updatedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    attendanceRecords: [
      {
        dateKey: {
          type: String, // YYYY-MM-DD
          required: true,
        },
        monthKey: {
          type: String, // YYYY-MM
          required: true,
        },
        status: {
          type: String,
          enum: ["Present", "Absent", "Half"],
          default: "Present",
        },
        note: {
          type: String,
          default: "",
        },
        markedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          default: null,
        },
        markedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Employee", EmployeeSchema);
