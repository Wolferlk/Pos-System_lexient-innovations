import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import MainLayout from "../layout/MainLayout";

const styles = `
  .cu-wrap { color: #e8ecff; }
  .cu-top { display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:16px; flex-wrap:wrap; }
  .cu-title { font-size:30px; font-weight:800; letter-spacing:-.4px; }
  .cu-sub { color:#8d97be; font-size:13px; margin-top:4px; }
  .cu-refresh { background:#f5a623; color:#111; border:none; border-radius:10px; padding:10px 14px; font-weight:700; cursor:pointer; }
  .cu-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:10px; margin-bottom:14px; }
  .cu-card { background:rgba(19,23,36,.8); border:1px solid rgba(255,255,255,.08); border-radius:12px; padding:12px; }
  .cu-k { color:#8d97be; font-size:12px; }
  .cu-v { font-size:24px; font-weight:800; margin-top:4px; }
  .cu-filters { display:grid; grid-template-columns:2fr 1fr 1fr; gap:10px; margin-bottom:12px; }
  .cu-input, .cu-select { width:100%; background:#171c2c; border:1px solid rgba(255,255,255,.09); color:#e8ecff; border-radius:10px; padding:11px 12px; }
  .cu-tableWrap { background:rgba(19,23,36,.8); border:1px solid rgba(255,255,255,.08); border-radius:12px; overflow:auto; }
  .cu-table { width:100%; border-collapse:collapse; min-width:900px; }
  .cu-table th { text-align:left; color:#8d97be; font-size:12px; font-weight:700; padding:12px; border-bottom:1px solid rgba(255,255,255,.08); text-transform:uppercase; letter-spacing:.8px; }
  .cu-table td { padding:12px; border-top:1px solid rgba(255,255,255,.06); }
  .cu-badge { display:inline-block; padding:4px 8px; border-radius:999px; font-size:11px; font-weight:700; }
  .cu-vip { background:rgba(245,166,35,.18); color:#f5a623; }
  .cu-normal { background:rgba(59,130,246,.15); color:#8dc0ff; }
  .cu-rowbtn { border:none; border-radius:8px; padding:7px 10px; font-weight:700; cursor:pointer; }
  .cu-save { background:#1f8b4c; color:#fff; margin-right:7px; }
  .cu-delete { background:#5b1f2a; color:#ff8f9f; }
  .cu-muted { color:#8d97be; text-align:center; padding:24px; }
  .cu-err { background:rgba(239,68,68,.12); border:1px solid rgba(239,68,68,.35); color:#ffb2bb; padding:10px 12px; border-radius:10px; margin-bottom:10px; }
  @media (max-width:900px){ .cu-filters { grid-template-columns:1fr; } }
`;

export default function Customers() {
  const token = localStorage.getItem("token");
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [type, setType] = useState("All");
  const [sortBy, setSortBy] = useState("spent_desc");
  const [editDiscount, setEditDiscount] = useState({});

  const fetchCustomers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get("http://localhost:5000/api/customers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCustomers(res.data || []);
      const draft = {};
      (res.data || []).forEach((c) => {
        draft[c._id] = c.discountPercentage ?? 0;
      });
      setEditDiscount(draft);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const updateDiscount = async (id) => {
    const discount = Number(editDiscount[id] ?? 0);
    try {
      await axios.put(
        `http://localhost:5000/api/customers/${id}`,
        { discountPercentage: discount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchCustomers();
    } catch (e) {
      alert(e.response?.data?.message || "Failed to update discount");
    }
  };

  const deleteCustomer = async (id) => {
    if (!window.confirm("Delete this customer?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/customers/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCustomers();
    } catch (e) {
      alert(e.response?.data?.message || "Failed to delete customer");
    }
  };

  const filtered = useMemo(() => {
    let data = [...customers];
    const q = search.trim().toLowerCase();

    if (q) {
      data = data.filter(
        (c) =>
          (c.name || "").toLowerCase().includes(q) ||
          (c.phone || "").includes(q) ||
          (c.email || "").toLowerCase().includes(q)
      );
    }
    if (type !== "All") data = data.filter((c) => c.type === type);

    if (sortBy === "spent_desc") data.sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0));
    if (sortBy === "spent_asc") data.sort((a, b) => (a.totalSpent || 0) - (b.totalSpent || 0));
    if (sortBy === "name_asc") data.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    if (sortBy === "newest") data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return data;
  }, [customers, search, type, sortBy]);

  const stats = useMemo(() => {
    const total = customers.length;
    const vip = customers.filter((c) => c.type === "VIP").length;
    const spent = customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
    const avgDiscount = total ? Math.round(customers.reduce((sum, c) => sum + (c.discountPercentage || 0), 0) / total) : 0;
    return { total, vip, spent, avgDiscount };
  }, [customers]);

  return (
    <MainLayout>
      <style>{styles}</style>
      <div className="cu-wrap">
        <div className="cu-top">
          <div>
            <div className="cu-title">Customer Management</div>
            <div className="cu-sub">Track members, loyalty discounts, and lifetime spending</div>
          </div>
          <button className="cu-refresh" onClick={fetchCustomers}>Refresh</button>
        </div>

        <div className="cu-grid">
          <div className="cu-card"><div className="cu-k">Total Customers</div><div className="cu-v">{stats.total}</div></div>
          <div className="cu-card"><div className="cu-k">VIP Members</div><div className="cu-v">{stats.vip}</div></div>
          <div className="cu-card"><div className="cu-k">Lifetime Spend</div><div className="cu-v">Rs. {stats.spent.toLocaleString()}</div></div>
          <div className="cu-card"><div className="cu-k">Avg Discount</div><div className="cu-v">{stats.avgDiscount}%</div></div>
        </div>

        {error && <div className="cu-err">{error}</div>}

        <div className="cu-filters">
          <input className="cu-input" placeholder="Search by name, phone, email..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <select className="cu-select" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="All">All Types</option>
            <option value="Normal">Normal</option>
            <option value="VIP">VIP</option>
          </select>
          <select className="cu-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="spent_desc">Top Spenders</option>
            <option value="spent_asc">Lowest Spenders</option>
            <option value="name_asc">Name A-Z</option>
            <option value="newest">Newest Joined</option>
          </select>
        </div>

        <div className="cu-tableWrap">
          <table className="cu-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Type</th>
                <th>Total Spent</th>
                <th>Discount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="cu-muted" colSpan="7">Loading customers...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td className="cu-muted" colSpan="7">No customers found</td></tr>
              ) : (
                filtered.map((customer) => (
                  <tr key={customer._id}>
                    <td>{customer.name}</td>
                    <td>{customer.phone}</td>
                    <td>{customer.email || "-"}</td>
                    <td>
                      <span className={`cu-badge ${customer.type === "VIP" ? "cu-vip" : "cu-normal"}`}>
                        {customer.type || "Normal"}
                      </span>
                    </td>
                    <td>Rs. {(customer.totalSpent || 0).toLocaleString()}</td>
                    <td>
                      <input
                        className="cu-input"
                        style={{ maxWidth: 90, padding: "7px 8px" }}
                        type="number"
                        min="0"
                        max="100"
                        value={editDiscount[customer._id] ?? 0}
                        onChange={(e) => setEditDiscount((p) => ({ ...p, [customer._id]: e.target.value }))}
                      />
                    </td>
                    <td>
                      <button className="cu-rowbtn cu-save" onClick={() => updateDiscount(customer._id)}>Save</button>
                      <button className="cu-rowbtn cu-delete" onClick={() => deleteCustomer(customer._id)}>Delete</button>
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
