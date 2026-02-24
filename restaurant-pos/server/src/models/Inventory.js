const mongoose = require("mongoose");

const InventorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true
    },
    unit: {
      type: String, // kg, g, liter, piece
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    lowStockAlert: {
      type: Number,
      default: 10
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Inventory", InventorySchema);