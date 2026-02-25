const Expense = require("../models/Expense");
const { logAction } = require("../utils/auditLogger");

// Create expense
exports.createExpense = async (req, res) => {
  try {
    const expense = await Expense.create(req.body);

    await logAction({
      req,
      action: "ADD_EXPENSE",
      task: "Add expense",
      module: "Expenses",
      description: `Expense ${expense.title || expense.category || expense._id} added`,
      entityType: "Expense",
      entityId: expense._id,
      payload: { amount: expense.amount, category: expense.category },
    });

    res.status(201).json(expense);
  } catch (error) {
    await logAction({
      req,
      action: "ADD_EXPENSE",
      task: "Add expense",
      module: "Expenses",
      status: "FAILED",
      description: "Create expense failed",
      payload: { message: error.message },
    });
    res.status(500).json({ message: error.message });
  }
};

// Get all expenses
exports.getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ expenseDate: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete expense
exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) return res.status(404).json({ message: "Expense not found" });

    await logAction({
      req,
      action: "DELETE_EXPENSE",
      task: "Delete expense",
      module: "Expenses",
      description: `Expense ${expense.title || expense.category || expense._id} deleted`,
      entityType: "Expense",
      entityId: expense._id,
      payload: { amount: expense.amount, category: expense.category },
    });

    res.json({ message: "Expense deleted" });
  } catch (error) {
    await logAction({
      req,
      action: "DELETE_EXPENSE",
      task: "Delete expense",
      module: "Expenses",
      status: "FAILED",
      description: "Delete expense failed",
      payload: { message: error.message, expenseId: req.params.id },
    });
    res.status(500).json({ message: error.message });
  }
};
