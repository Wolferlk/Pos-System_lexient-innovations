const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      unique: true,
    },

    items: [
      {
        itemId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Item",
        },
        name: String,
        quantity: Number,
        price: Number,
        portion: {
          type: String,
          default: "Full",
        },
        discount: {
          type: Number,
          default: 0,
        },
        total: Number,
      },
    ],

    subTotal: Number,
    totalDiscount: {
      type: Number,
      default: 0,
    },
    grandTotal: Number,

    paymentMethod: {
      type: String,
      enum: ["Cash", "Card", "Online", "Travel Package", "Bank Transfer", "Unpaid"],
      default: "Cash",
    },

    customerPhone: {
      type: String,
      default: null,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    status: {
      type: String,
      default: "Completed",
    },

    isSynced: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
