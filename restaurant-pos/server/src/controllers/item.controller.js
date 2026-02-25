const Item = require("../models/Item");
const { logAction } = require("../utils/auditLogger");

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

    await logAction({
      req,
      action: "ADD_ITEM",
      task: "Add item",
      module: "Items",
      description: `Item ${item.name} created`,
      entityType: "Item",
      entityId: item._id,
      payload: { category: item.category, itemId: item.itemId },
    });

    res.status(201).json(item);
  } catch (error) {
    await logAction({
      req,
      action: "ADD_ITEM",
      task: "Add item",
      module: "Items",
      status: "FAILED",
      description: "Create item failed",
      payload: { message: error.message },
    });
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
    const before = await Item.findById(req.params.id);
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!item) return res.status(404).json({ message: "Item not found" });

    await logAction({
      req,
      action: "EDIT_ITEM",
      task: "Edit item",
      module: "Items",
      description: `Item ${item.name} updated`,
      entityType: "Item",
      entityId: item._id,
      payload: { before, after: item },
    });

    res.json(item);
  } catch (error) {
    await logAction({
      req,
      action: "EDIT_ITEM",
      task: "Edit item",
      module: "Items",
      status: "FAILED",
      description: "Update item failed",
      payload: { message: error.message, itemId: req.params.id },
    });
    res.status(500).json({ message: error.message });
  }
};

// Delete Item
exports.deleteItem = async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    await logAction({
      req,
      action: "DELETE_ITEM",
      task: "Delete item",
      module: "Items",
      description: `Item ${item.name} deleted`,
      entityType: "Item",
      entityId: item._id,
      payload: { category: item.category, itemId: item.itemId },
    });

    res.json({ message: "Item deleted successfully" });
  } catch (error) {
    await logAction({
      req,
      action: "DELETE_ITEM",
      task: "Delete item",
      module: "Items",
      status: "FAILED",
      description: "Delete item failed",
      payload: { message: error.message, itemId: req.params.id },
    });
    res.status(500).json({ message: error.message });
  }
};
