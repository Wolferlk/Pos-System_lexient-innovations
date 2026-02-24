import React, { useEffect, useState } from "react";
import axios from "axios";
import MainLayout from "../layout/MainLayout";

export default function Admin() {
  const [lowStock, setLowStock] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchLowStock();
  }, []);

  const fetchLowStock = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/inventory/low-stock",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setLowStock(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <MainLayout>
      <h1 className="text-3xl font-bold mb-6">
        Admin Dashboard 🔥
      </h1>

      {lowStock.length > 0 && (
        <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded-lg mb-6">
          <h2 className="font-bold mb-2">⚠ Low Stock Alert</h2>

          {lowStock.map((item) => (
            <p key={item._id}>
              {item.name} — Remaining: {item.quantity} {item.unit}
            </p>
          ))}
        </div>
      )}

      {lowStock.length === 0 && (
        <div className="bg-green-100 p-4 rounded-lg">
          ✅ All inventory levels are healthy.
        </div>
      )}
    </MainLayout>
  );
}