const Order = require("../models/Order");
const Item = require("../models/Item");
const Customer = require("../models/Customer");
const Inventory = require("../models/Inventory");
const { logAction } = require("../utils/auditLogger");

// Generate Invoice Number
const generateInvoiceNumber = () => {
  const timestamp = Date.now();
  return `INV-${timestamp}`;
};

// Create Order
exports.createOrder = async (req, res) => {
  try {
    const { items, paymentMethod, customerPhone } = req.body;

    let subTotal = 0;
    let totalDiscount = 0;

    // Calculate totals
    const processedItems = await Promise.all(
      items.map(async (orderItem) => {
        const item = await Item.findById(orderItem.itemId);

        if (!item) throw new Error("Item not found");

        const price = orderItem.price;
        const discount = orderItem.discount || 0;
        const total = (price - discount) * orderItem.quantity;

        subTotal += price * orderItem.quantity;
        totalDiscount += discount * orderItem.quantity;

        // Increase sales count
        item.salesCount += orderItem.quantity;
        await item.save();

        // Deduct inventory
        for (const ingredient of item.ingredients) {
        const inventoryItem = await Inventory.findById(ingredient.inventoryId);

        if (inventoryItem) {
            inventoryItem.quantity -= ingredient.quantityRequired * orderItem.quantity;
            await inventoryItem.save();
        }
        }

        return {
          itemId: item._id,
          name: item.name,
          quantity: orderItem.quantity,
          price,
          discount,
          portion: orderItem.portion || "Full",
          total,
        };
      })
    );

    const grandTotal = subTotal - totalDiscount;

    const order = await Order.create({
      invoiceNumber: generateInvoiceNumber(),
      items: processedItems,
      subTotal,
      totalDiscount,
      grandTotal,
      paymentMethod,
      customerPhone: customerPhone || null,
      createdBy: req.user.id,
    });

    if (customerPhone) {
      const customer = await Customer.findOne({ phone: customerPhone });

      if (customer) {
        customer.totalSpent += grandTotal;

        // Auto-upgrade to VIP after threshold is crossed.
        if (customer.totalSpent > 50000) {
          customer.type = "VIP";
          customer.discountPercentage = 15;
        }

        await customer.save();
      }
    }

    await logAction({
      req,
      action: "CREATE_ORDER",
      task: "Create order",
      module: "Orders",
      description: `Invoice ${order.invoiceNumber} created`,
      entityType: "Order",
      entityId: order._id,
      payload: {
        invoiceNumber: order.invoiceNumber,
        itemCount: order.items?.length || 0,
        grandTotal: order.grandTotal,
        paymentMethod: order.paymentMethod,
      },
    });

    res.status(201).json(order);
  } catch (error) {
    await logAction({
      req,
      action: "CREATE_ORDER",
      task: "Create order",
      module: "Orders",
      status: "FAILED",
      description: "Create order failed",
      payload: { message: error.message },
    });
    res.status(500).json({ message: error.message });
  }
};

// Get All Orders
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    await logAction({
      req,
      action: "DELETE_ORDER",
      task: "Delete order",
      module: "Orders",
      description: `Order ${order.invoiceNumber || order._id} deleted`,
      entityType: "Order",
      entityId: order._id,
      payload: { invoiceNumber: order.invoiceNumber, grandTotal: order.grandTotal },
    });

    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    await logAction({
      req,
      action: "DELETE_ORDER",
      task: "Delete order",
      module: "Orders",
      status: "FAILED",
      description: "Delete order failed",
      payload: { message: error.message, orderId: req.params.id },
    });
    res.status(500).json({ message: error.message });
  }
};
