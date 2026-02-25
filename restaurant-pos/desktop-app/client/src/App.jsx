import React from "react";
import { BrowserRouter, HashRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Cashier from "./pages/Cashier";
import Admin from "./pages/Admin";
import Register from "./pages/Register";
import Reports from "./pages/Reports";
import OrderHistory from "./pages/OrderHistory";
import ManageItems from "./pages/ManageItems";
import Employees from "./pages/Employees";
import Expenses from "./pages/Expenses";
import Customers from "./pages/Customers";
import User from "./pages/Users";
import AuditLogs from "./pages/AuditLogs";
import CashierAttendance from "./pages/CashierAttendance";

function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
}

export default function App() {
  const Router = window.location.protocol === "file:" ? HashRouter : BrowserRouter;

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path = "/cashier"element={ <PrivateRoute> <Cashier /> </PrivateRoute> } />
        <Route
          path="/cashier/attendance"
          element={
            <PrivateRoute>
              <CashierAttendance />
            </PrivateRoute>
          }
        />
        


        <Route
  path="/admin/items"
  element={
    <PrivateRoute>
      <ManageItems />
    </PrivateRoute>
  }
/>

<Route
  path="/admin/users"
  element={
    <PrivateRoute>
      <User />
    </PrivateRoute>
  }
/>


        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <Admin />
            </PrivateRoute>
          }
        />

                    <Route
            path="/admin/reports"
            element={
                <PrivateRoute>
                <Reports />
                </PrivateRoute>
            }
            />

                            <Route
                path="/admin/employees"
                element={
                    <PrivateRoute>
                    <Employees />
                    </PrivateRoute>
                }
                />
                <Route
  path="/admin/customers"
  element={
    <PrivateRoute>
      <Customers />
    </PrivateRoute>
  }
/>

            <Route
  path="/admin/orders"
  element={
    <PrivateRoute>
      <OrderHistory />
    </PrivateRoute>
  }
/>

<Route
  path="/admin/expenses"
  element={
    <PrivateRoute>
      <Expenses />
    </PrivateRoute>
  }
/>

<Route
  path="/admin/audit-logs"
  element={
    <PrivateRoute>
      <AuditLogs />
    </PrivateRoute>
  }
/>

<Route
  path="/admin/register-user"
  element={
    <PrivateRoute>
      <Register />
    </PrivateRoute>
  }
/>

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}
