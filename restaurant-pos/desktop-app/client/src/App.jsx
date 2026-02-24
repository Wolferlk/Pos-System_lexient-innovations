import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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

function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path = "/cashier"element={ <PrivateRoute> <Cashier /> </PrivateRoute> } />
        


        <Route
  path="/admin/items"
  element={
    <PrivateRoute>
      <ManageItems />
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

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}