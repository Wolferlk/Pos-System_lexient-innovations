const express = require("express");
const cors = require("cors");

const { verifyToken, authorizeRoles } = require("./middleware/auth.middleware");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/items", require("./routes/item.routes"));
app.use("/api/orders", require("./routes/order.routes"));
app.use("/api/reports", require("./routes/report.routes"));
app.use("/api/inventory", require("./routes/inventory.routes"));
app.use("/api/customers", require("./routes/customer.routes"));
app.use("/api/employees", require("./routes/employee.routes"));
app.use("/api/expenses", require("./routes/expense.routes"));
app.use("/api/users", require("./routes/user.routes"));
app.use("/api/logs", require("./routes/log.routes"));
app.use("/api/offline", require("./routes/offline.routes"));

// 🔐 Protected test route
app.get("/api/admin-only", verifyToken, authorizeRoles("admin"), (req, res) => {
  res.json({ message: "Welcome Admin 🔥" });
});

app.get("/api/cashier-only", verifyToken, authorizeRoles("cashier", "admin"), (req, res) => {
  res.json({ message: "Welcome Cashier 💰" });
});

app.get("/", (req, res) => {
  res.send("Restaurant POS API Running...");
});

module.exports = app;
