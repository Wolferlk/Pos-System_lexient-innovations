const Customer = require("../models/Customer");
const { logAction } = require("../utils/auditLogger");

// Register customer
exports.createCustomer = async (req, res) => {
  try {
    const customer = await Customer.create(req.body);

    await logAction({
      req,
      action: "ADD_CUSTOMER",
      task: "Add customer",
      module: "Customers",
      description: `Customer ${customer.phone} created`,
      entityType: "Customer",
      entityId: customer._id,
      payload: { name: customer.name, phone: customer.phone },
    });

    res.status(201).json(customer);
  } catch (error) {
    await logAction({
      req,
      action: "ADD_CUSTOMER",
      task: "Add customer",
      module: "Customers",
      status: "FAILED",
      description: "Create customer failed",
      payload: { message: error.message },
    });
    res.status(500).json({ message: error.message });
  }
};

// Get by phone
exports.getCustomerByPhone = async (req, res) => {
  try {
    const customer = await Customer.findOne({
      phone: req.params.phone,
    });

    if (!customer)
      return res.status(404).json({ message: "Not found" });

    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all customers
exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update customer
exports.updateCustomer = async (req, res) => {
  try {
    const before = await Customer.findById(req.params.id);
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    await logAction({
      req,
      action: "EDIT_CUSTOMER",
      task: "Edit customer",
      module: "Customers",
      description: `Customer ${customer.phone} updated`,
      entityType: "Customer",
      entityId: customer._id,
      payload: { before, after: customer },
    });

    res.json(customer);
  } catch (error) {
    await logAction({
      req,
      action: "EDIT_CUSTOMER",
      task: "Edit customer",
      module: "Customers",
      status: "FAILED",
      description: "Update customer failed",
      payload: { message: error.message, customerId: req.params.id },
    });
    res.status(500).json({ message: error.message });
  }
};

// Delete customer
exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    await logAction({
      req,
      action: "DELETE_CUSTOMER",
      task: "Delete customer",
      module: "Customers",
      description: `Customer ${customer.phone} deleted`,
      entityType: "Customer",
      entityId: customer._id,
    });

    res.json({ message: "Customer deleted" });
  } catch (error) {
    await logAction({
      req,
      action: "DELETE_CUSTOMER",
      task: "Delete customer",
      module: "Customers",
      status: "FAILED",
      description: "Delete customer failed",
      payload: { message: error.message, customerId: req.params.id },
    });
    res.status(500).json({ message: error.message });
  }
};
