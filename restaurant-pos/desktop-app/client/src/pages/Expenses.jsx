import React, { useEffect, useState } from "react";
import axios from "axios";
import MainLayout from "../layout/MainLayout";

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({
    title: "",
    category: "Other",
    amount: "",
    description: "",
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    const res = await axios.get(
      "http://localhost:5000/api/expenses",
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setExpenses(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await axios.post(
      "http://localhost:5000/api/expenses",
      {
        ...form,
        amount: Number(form.amount),
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setForm({
      title: "",
      category: "Other",
      amount: "",
      description: "",
    });

    fetchExpenses();
  };

  const deleteExpense = async (id) => {
    await axios.delete(
      `http://localhost:5000/api/expenses/${id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchExpenses();
  };

  const totalExpense = expenses.reduce(
    (sum, exp) => sum + exp.amount,
    0
  );

  return (
    <MainLayout>
      <h1 className="text-3xl font-bold mb-6">
        💸 Company Expenses
      </h1>

      {/* Add Expense Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow mb-6 grid grid-cols-2 gap-4"
      >
        <input
          placeholder="Title"
          value={form.title}
          onChange={(e) =>
            setForm({ ...form, title: e.target.value })
          }
          className="p-3 border rounded"
          required
        />

        <select
          value={form.category}
          onChange={(e) =>
            setForm({ ...form, category: e.target.value })
          }
          className="p-3 border rounded"
        >
          <option>Rent</option>
          <option>Electricity</option>
          <option>Supplies</option>
          <option>Maintenance</option>
          <option>Other</option>
        </select>

        <input
          type="number"
          placeholder="Amount"
          value={form.amount}
          onChange={(e) =>
            setForm({ ...form, amount: e.target.value })
          }
          className="p-3 border rounded"
          required
        />

        <input
          placeholder="Description"
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
          className="p-3 border rounded"
        />

        <button className="col-span-2 bg-green-600 text-white py-3 rounded-lg font-bold">
          Add Expense
        </button>
      </form>

      {/* Expense List */}
      <div className="bg-white rounded-xl shadow p-4 mb-4">
        <h2 className="font-bold text-lg">
          Total Expenses: Rs. {totalExpense}
        </h2>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4">Title</th>
              <th className="p-4">Category</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Date</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((exp) => (
              <tr key={exp._id} className="border-t">
                <td className="p-4">{exp.title}</td>
                <td className="p-4">{exp.category}</td>
                <td className="p-4 text-red-600 font-bold">
                  Rs. {exp.amount}
                </td>
                <td className="p-4">
                  {new Date(exp.expenseDate).toLocaleDateString()}
                </td>
                <td className="p-4">
                  <button
                    onClick={() =>
                      deleteExpense(exp._id)
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