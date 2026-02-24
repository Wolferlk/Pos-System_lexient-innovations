import React, { useEffect, useState } from "react";
import axios from "axios";
import MainLayout from "../layout/MainLayout";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    const res = await axios.get(
      "http://localhost:5000/api/customers",
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setCustomers(res.data);
  };

  const updateDiscount = async (id, discount) => {
    await axios.put(
      `http://localhost:5000/api/customers/${id}`,
      { discountPercentage: Number(discount) },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchCustomers();
  };

  const deleteCustomer = async (id) => {
    await axios.delete(
      `http://localhost:5000/api/customers/${id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchCustomers();
  };

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  return (
    <MainLayout>
      <h1 className="text-3xl font-bold mb-6">
        👥 Customer Management
      </h1>

      <input
        placeholder="Search by name or phone..."
        className="p-3 border rounded mb-6 w-full"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Phone</th>
              <th className="p-4 text-left">Type</th>
              <th className="p-4 text-left">Total Spent</th>
              <th className="p-4 text-left">Discount %</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((customer) => (
              <tr key={customer._id} className="border-t">
                <td className="p-4 font-semibold">
                  {customer.name}
                </td>
                <td className="p-4">{customer.phone}</td>
                <td className="p-4">
                  {customer.type === "VIP" ? (
                    <span className="bg-yellow-400 px-2 py-1 rounded text-sm font-bold">
                      VIP
                    </span>
                  ) : (
                    "Normal"
                  )}
                </td>
                <td className="p-4">
                  Rs. {customer.totalSpent}
                </td>
                <td className="p-4">
                  <input
                    type="number"
                    defaultValue={customer.discountPercentage}
                    className="w-20 border rounded p-1"
                    onBlur={(e) =>
                      updateDiscount(customer._id, e.target.value)
                    }
                  />
                </td>
                <td className="p-4">
                  <button
                    onClick={() =>
                      deleteCustomer(customer._id)
                    }
                    className="text-red-600 font-semibold"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </MainLayout>
  );
}