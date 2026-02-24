import React, { useEffect, useState } from "react";
import axios from "axios";
import MainLayout from "../layout/MainLayout";

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/orders",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setOrders(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <MainLayout>
      <h1 className="text-3xl font-bold mb-6">📜 Order History</h1>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 text-left">Invoice</th>
              <th className="p-4 text-left">Total</th>
              <th className="p-4 text-left">Payment</th>
              <th className="p-4 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id} className="border-t">
                <td className="p-4 font-semibold">
                  {order.invoiceNumber}
                </td>
                <td className="p-4 text-green-600 font-bold">
                  Rs. {order.grandTotal}
                </td>
                <td className="p-4">
                  {order.paymentMethod}
                </td>
                <td className="p-4">
                  {new Date(order.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </MainLayout>
  );
}