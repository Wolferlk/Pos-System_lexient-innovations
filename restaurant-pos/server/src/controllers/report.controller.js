const Order = require("../models/Order");
const mongoose = require("mongoose");

// 📊 Daily Report
exports.getDailyReport = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const orders = await Order.find({
      createdAt: { $gte: today }
    });

    const totalSales = orders.reduce((sum, order) => sum + order.grandTotal, 0);

    res.json({
      date: today,
      totalOrders: orders.length,
      totalSales
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📊 Monthly Report
exports.getMonthlyReport = async (req, res) => {
  try {
    const year = new Date().getFullYear();
    const month = new Date().getMonth();

    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 1);

    const orders = await Order.find({
      createdAt: { $gte: start, $lt: end }
    });

    const totalSales = orders.reduce((sum, order) => sum + order.grandTotal, 0);

    res.json({
      month: month + 1,
      totalOrders: orders.length,
      totalSales
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📊 Sales Grouped by Day (Chart Data)
exports.getSalesChart = async (req, res) => {
  try {
    const data = await Order.aggregate([
      {
        $group: {
          _id: {
            day: { $dayOfMonth: "$createdAt" },
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" }
          },
          totalSales: { $sum: "$grandTotal" },
          totalOrders: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
    ]);

    res.json(data);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};