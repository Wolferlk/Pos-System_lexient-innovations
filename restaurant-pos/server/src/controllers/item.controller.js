const Item = require("../models/Item");

// Create Item
exports.createItem = async (req, res) => {
  try {
    const {
      name,
      category,
      portion,
      note,
      specialDiscount,
      availableTime,
      available,
    } = req.body;

    if (!name || !category || !portion?.fullPrice) {
      return res.status(400).json({
        message: "Name, category and full price are required",
      });
    }

    const item = await Item.create({
      itemId: `ITEM-${Date.now()}`,   // ✅ Generate unique ID
      name,
      category,
      portion: {
        fullPrice: Number(portion.fullPrice),
        smallPrice: portion.smallPrice
          ? Number(portion.smallPrice)
          : undefined,
      },
      note,
      specialDiscount: specialDiscount || 0,
      available: available ?? true,
      availableTime,
    });

    res.status(201).json(item);
  } catch (error) {
    console.error("CREATE ITEM ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get All Items
exports.getItems = async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Item
exports.updateItem = async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Item
exports.deleteItem = async (req, res) => {
  try {
    await Item.findByIdAndDelete(req.params.id);
    res.json({ message: "Item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};