const Order = require("../models/Order");
const Item = require("../models/Item");
const Customer = require("../models/Customer");
const Inventory = require("../models/Inventory");

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

    res.status(201).json(order);
  } catch (error) {
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
