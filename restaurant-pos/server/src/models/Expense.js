const mongoose = require("mongoose");

const ExpenseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["Rent", "Electricity", "Supplies", "Maintenance", "Other"],
      default: "Other",
    },
    amount: {
      type: Number,
      required: true,
    },
    description: String,
    expenseDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Expense", ExpenseSchema);