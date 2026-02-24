const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema(
  {
    itemId: {
      type: String,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    Photolink: {
      type: String,
    },
    category: {
      type: String,
      required: true,
    },
    portion: {
      fullPrice: {
        type: Number,
        required: true,
      },
      smallPrice: {
        type: Number,
      },
    },
    note: String,
    image: String,
    spicyLevel: String,
    specialDiscount: {
      type: Number,
      default: 0,
    },
    available: {
      type: Boolean,
      default: true,
    },
    availableTime: {
      type: String,
      enum: ["Breakfast", "Lunch", "Dinner", "All the Day"],
    },
    salesCount: {
      type: Number,
      default: 0,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    isSynced: {
      type: Boolean,
      default: false,
    },
    ingredients: [
  {
    inventoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inventory"
    },
    quantityRequired: Number
  }
],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Item", ItemSchema);