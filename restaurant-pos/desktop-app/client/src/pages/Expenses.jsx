import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import MainLayout from "../layout/MainLayout";
import { generateDetailedReportPdf } from "../utils/reportPdf";

const styles = `
  .ex-wrap { color:#e8ecff; }
  .ex-top { display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; gap:12px; flex-wrap:wrap; }
  .ex-title { font-size:30px; font-weight:800; letter-spacing:-.4px; }
  .ex-sub { color:#8d97be; font-size:13px; margin-top:4px; }
  .ex-refresh { background:#f5a623; color:#111; border:none; border-radius:10px; padding:10px 14px; font-weight:700; cursor:pointer; }
  .ex-pdf { background:#2563eb; color:#fff; border:none; border-radius:10px; padding:10px 14px; font-weight:700; cursor:pointer; }
  .ex-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:10px; margin-bottom:14px; }
  .ex-card { background:rgba(19,23,36,.8); border:1px solid rgba(255,255,255,.08); border-radius:12px; padding:12px; }
  .ex-k { color:#8d97be; font-size:12px; }
  .ex-v { font-size:24px; font-weight:800; margin-top:4px; }
  .ex-form { background:rgba(19,23,36,.8); border:1px solid rgba(255,255,255,.08); border-radius:12px; padding:14px; margin-bottom:12px; display:grid; grid-template-columns:2fr 1fr 1fr 2fr auto; gap:10px; align-items:center; }
  .ex-input, .ex-select { width:100%; background:#171c2c; border:1px solid rgba(255,255,255,.09); color:#e8ecff; border-radius:10px; padding:11px 12px; }
  .ex-add { background:#22c55e; color:#fff; border:none; border-radius:10px; padding:11px 14px; font-weight:700; cursor:pointer; }
  .ex-filters { display:grid; grid-template-columns:2fr 1fr 1fr 1fr 1fr 1fr; gap:10px; margin-bottom:12px; }
  .ex-tableWrap { background:rgba(19,23,36,.8); border:1px solid rgba(255,255,255,.08); border-radius:12px; overflow:auto; }
  .ex-table { width:100%; border-collapse:collapse; min-width:950px; }
  .ex-table th { text-align:left; color:#8d97be; font-size:12px; font-weight:700; padding:12px; border-bottom:1px solid rgba(255,255,255,.08); text-transform:uppercase; letter-spacing:.8px; }
  .ex-table td { padding:12px; border-top:1px solid rgba(255,255,255,.06); }
  .ex-del { border:none; border-radius:8px; padding:7px 10px; font-weight:700; cursor:pointer; background:#5b1f2a; color:#ff8f9f; }
  .ex-money { color:#ff9f9f; font-weight:700; }
  .ex-muted { color:#8d97be; text-align:center; padding:24px; }
  @media (max-width:1100px){ .ex-form { grid-template-columns:1fr; } .ex-filters { grid-template-columns:1fr; } }
`;

const CATEGORIES = ["Rent", "Electricity", "Supplies", "Maintenance", "Other"];

export default function Expenses() {
  const token = localStorage.getItem("token");
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [monthFilter, setMonthFilter] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [form, setForm] = useState({
    title: "",
    category: "Other",
    amount: "",
    description: "",
  });

  const fetchExpenses = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get("http://localhost:5000/api/expenses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExpenses(res.data || []);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load expenses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://localhost:5000/api/expenses",
        { ...form, amount: Number(form.amount) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setForm({ title: "", category: "Other", amount: "", description: "" });
      fetchExpenses();
    } catch (e2) {
      alert(e2.response?.data?.message || "Failed to add expense");
    }
  };

  const deleteExpense = async (id) => {
    if (!window.confirm("Delete this expense?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/expenses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchExpenses();
    } catch (e) {
      alert(e.response?.data?.message || "Failed to delete expense");
    }
  };

  const filtered = useMemo(() => {
    let data = [...expenses];
    const q = search.trim().toLowerCase();
    if (q) {
      data = data.filter(
        (exp) =>
          (exp.title || "").toLowerCase().includes(q) ||
          (exp.description || "").toLowerCase().includes(q) ||
          (exp.category || "").toLowerCase().includes(q)
      );
    }
    if (categoryFilter !== "All") data = data.filter((exp) => exp.category === categoryFilter);
    if (monthFilter !== "All") {
      data = data.filter((exp) => {
        const d = new Date(exp.expenseDate);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        return key === monthFilter;
      });
    }
    if (fromDate) data = data.filter((exp) => new Date(exp.expenseDate) >= new Date(fromDate));
    if (toDate) data = data.filter((exp) => new Date(exp.expenseDate) <= new Date(toDate));
    data.sort((a, b) => new Date(b.expenseDate) - new Date(a.expenseDate));
    return data;
  }, [expenses, search, categoryFilter, monthFilter, fromDate, toDate]);

  const monthOptions = useMemo(() => {
    const set = new Set(
      expenses.map((exp) => {
        const d = new Date(exp.expenseDate);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      })
    );
    return ["All", ...Array.from(set).sort((a, b) => (a < b ? 1 : -1))];
  }, [expenses]);

  const stats = useMemo(() => {
    const total = filtered.reduce((sum, exp) => sum + (exp.amount || 0), 0);
    const count = filtered.length;
    const avg = count ? Math.round(total / count) : 0;
    const top = filtered.reduce((max, exp) => (exp.amount > (max?.amount || 0) ? exp : max), null);
    return { total, count, avg, top };
  }, [filtered]);

  const exportPdf = () => {
    generateDetailedReportPdf({
      title: "Company Expenses Detailed Report",
      subtitle: "Filtered operational expense report",
      filters: [
        { label: "Search", value: search || "None" },
        { label: "Category", value: categoryFilter },
        { label: "Month", value: monthFilter },
        { label: "From", value: fromDate || "Any" },
        { label: "To", value: toDate || "Any" },
      ],
      summary: [
        { label: "Total Spend", value: `Rs. ${stats.total.toLocaleString()}` },
        { label: "Entries", value: stats.count },
        { label: "Average Expense", value: `Rs. ${stats.avg.toLocaleString()}` },
        { label: "Highest Expense", value: `Rs. ${(stats.top?.amount || 0).toLocaleString()}` },
      ],
      columns: ["Date", "Title", "Category", "Description", "Amount (Rs.)"],
      rows: filtered.map((e) => [
        new Date(e.expenseDate).toLocaleString(),
        e.title || "-",
        e.category || "-",
        e.description || "-",
        Number(e.amount || 0).toLocaleString(),
      ]),
    });
  };

  return (
    <MainLayout>
      <style>{styles}</style>
      <div className="ex-wrap">
        <div className="ex-top">
          <div>
            <div className="ex-title">Company Expenses</div>
            <div className="ex-sub">Track operational costs with category and time-based analysis</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="ex-pdf" onClick={exportPdf}>Generate PDF</button>
            <button className="ex-refresh" onClick={fetchExpenses}>Refresh</button>
          </div>
        </div>

        <div className="ex-grid">
          <div className="ex-card"><div className="ex-k">Total Spend</div><div className="ex-v">Rs. {stats.total.toLocaleString()}</div></div>
          <div className="ex-card"><div className="ex-k">Entries</div><div className="ex-v">{stats.count}</div></div>
          <div className="ex-card"><div className="ex-k">Average Expense</div><div className="ex-v">Rs. {stats.avg.toLocaleString()}</div></div>
          <div className="ex-card"><div className="ex-k">Highest Expense</div><div className="ex-v">Rs. {(stats.top?.amount || 0).toLocaleString()}</div></div>
        </div>

        <form className="ex-form" onSubmit={handleSubmit}>
          <input
            className="ex-input"
            placeholder="Expense title"
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            required
          />
          <select
            className="ex-select"
            value={form.category}
            onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
          >
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <input
            className="ex-input"
            type="number"
            min="0"
            placeholder="Amount"
            value={form.amount}
            onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
            required
          />
          <input
            className="ex-input"
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
          />
          <button className="ex-add" type="submit">Add Expense</button>
        </form>

        {error && <div style={{ color: "#ffb2bb", marginBottom: 10 }}>{error}</div>}

        <div className="ex-filters">
          <input
            className="ex-input"
            placeholder="Search by title, category, description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className="ex-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="All">All Categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="ex-select" value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)}>
            {monthOptions.map((m) => <option key={m} value={m}>{m === "All" ? "All Months" : m}</option>)}
          </select>
          <input
            className="ex-input"
            type="datetime-local"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
          <input
            className="ex-input"
            type="datetime-local"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
          <button
            className="ex-refresh"
            style={{ width: "100%" }}
            onClick={() => {
              setSearch("");
              setCategoryFilter("All");
              setMonthFilter("All");
              setFromDate("");
              setToDate("");
            }}
          >
            Clear Filters
          </button>
        </div>

        <div className="ex-tableWrap">
          <table className="ex-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="ex-muted" colSpan="6">Loading expenses...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td className="ex-muted" colSpan="6">No expenses found</td></tr>
              ) : (
                filtered.map((exp) => (
                  <tr key={exp._id}>
                    <td>{exp.title}</td>
                    <td>{exp.category}</td>
                    <td>{exp.description || "-"}</td>
                    <td className="ex-money">Rs. {(exp.amount || 0).toLocaleString()}</td>
                    <td>{new Date(exp.expenseDate).toLocaleDateString()}</td>
                    <td>
                      <button className="ex-del" onClick={() => deleteExpense(exp._id)}>Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
}
