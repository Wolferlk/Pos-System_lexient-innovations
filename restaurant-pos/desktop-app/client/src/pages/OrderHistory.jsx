import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import MainLayout from "../layout/MainLayout";
import { generateDetailedReportPdf } from "../utils/reportPdf";

const styles = `
  .oh-wrap { color:#e8ecff; }
  .oh-top { display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; gap:12px; flex-wrap:wrap; }
  .oh-title { font-size:30px; font-weight:800; letter-spacing:-.4px; }
  .oh-sub { color:#8d97be; font-size:13px; margin-top:4px; }
  .oh-refresh { background:#f5a623; color:#111; border:none; border-radius:10px; padding:10px 14px; font-weight:700; cursor:pointer; }
  .oh-pdf { background:#2563eb; color:#fff; border:none; border-radius:10px; padding:10px 14px; font-weight:700; cursor:pointer; }
  .oh-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:10px; margin-bottom:14px; }
  .oh-card { background:rgba(19,23,36,.8); border:1px solid rgba(255,255,255,.08); border-radius:12px; padding:12px; }
  .oh-k { color:#8d97be; font-size:12px; }
  .oh-v { font-size:24px; font-weight:800; margin-top:4px; }
  .oh-filters { display:grid; grid-template-columns:2fr 1fr 1fr 1fr 1fr 1fr; gap:10px; margin-bottom:12px; }
  .oh-input, .oh-select { width:100%; background:#171c2c; border:1px solid rgba(255,255,255,.09); color:#e8ecff; border-radius:10px; padding:11px 12px; }
  .oh-tableWrap { background:rgba(19,23,36,.8); border:1px solid rgba(255,255,255,.08); border-radius:12px; overflow:auto; }
  .oh-table { width:100%; border-collapse:collapse; min-width:980px; }
  .oh-table th { text-align:left; color:#8d97be; font-size:12px; font-weight:700; padding:12px; border-bottom:1px solid rgba(255,255,255,.08); text-transform:uppercase; letter-spacing:.8px; }
  .oh-table td { padding:12px; border-top:1px solid rgba(255,255,255,.06); vertical-align:top; }
  .oh-money { color:#8dedb2; font-weight:700; }
  .oh-badge { display:inline-block; padding:4px 8px; border-radius:999px; font-size:11px; font-weight:700; }
  .oh-empty { text-align:center; color:#8d97be; padding:24px; }
  .oh-cash { background:rgba(34,197,94,.16); color:#86efac; }
  .oh-cardpay { background:rgba(59,130,246,.16); color:#93c5fd; }
  .oh-bank { background:rgba(168,85,247,.16); color:#d8b4fe; }
  .oh-travel { background:rgba(20,184,166,.16); color:#5eead4; }
  .oh-unpaid { background:rgba(239,68,68,.16); color:#fca5a5; }
  .oh-other { background:rgba(245,166,35,.16); color:#fcd38d; }
  @media (max-width:980px){ .oh-filters { grid-template-columns:1fr; } }
`;

const payClass = (m) => {
  if (m === "Cash") return "oh-cash";
  if (m === "Card") return "oh-cardpay";
  if (m === "Bank Transfer") return "oh-bank";
  if (m === "Travel Package") return "oh-travel";
  if (m === "Unpaid") return "oh-unpaid";
  return "oh-other";
};

export default function OrderHistory() {
  const token = localStorage.getItem("token");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [payment, setPayment] = useState("All");
  const [range, setRange] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get("http://localhost:5000/api/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data || []);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filtered = useMemo(() => {
    const now = new Date();
    let data = [...orders];
    const q = search.trim().toLowerCase();

    if (q) {
      data = data.filter((o) =>
        (o.invoiceNumber || "").toLowerCase().includes(q) ||
        (o.paymentMethod || "").toLowerCase().includes(q) ||
        (o.customerPhone || "").toLowerCase().includes(q)
      );
    }

    if (payment !== "All") data = data.filter((o) => o.paymentMethod === payment);

    if (range !== "All") {
      data = data.filter((o) => {
        const d = new Date(o.createdAt);
        if (range === "Today") return d.toDateString() === now.toDateString();
        if (range === "This Week") {
          const start = new Date(now);
          start.setDate(now.getDate() - 7);
          return d >= start;
        }
        if (range === "This Month") return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        return true;
      });
    }
    if (fromDate) data = data.filter((o) => new Date(o.createdAt) >= new Date(fromDate));
    if (toDate) data = data.filter((o) => new Date(o.createdAt) <= new Date(toDate));

    data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return data;
  }, [orders, search, payment, range, fromDate, toDate]);

  const stats = useMemo(() => {
    const totalOrders = filtered.length;
    const revenue = filtered.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
    const unpaid = filtered.filter((o) => o.paymentMethod === "Unpaid").length;
    const avg = totalOrders ? Math.round(revenue / totalOrders) : 0;
    return { totalOrders, revenue, unpaid, avg };
  }, [filtered]);

  const exportPdf = () => {
    generateDetailedReportPdf({
      title: "Order History Detailed Report",
      subtitle: "Filtered order data with totals and payment method details",
      filters: [
        { label: "Search", value: search || "None" },
        { label: "Payment", value: payment },
        { label: "Quick Range", value: range },
        { label: "From", value: fromDate || "Any" },
        { label: "To", value: toDate || "Any" },
      ],
      summary: [
        { label: "Orders", value: stats.totalOrders },
        { label: "Revenue", value: `Rs. ${stats.revenue.toLocaleString()}` },
        { label: "Unpaid Bills", value: stats.unpaid },
        { label: "Average Ticket", value: `Rs. ${stats.avg.toLocaleString()}` },
      ],
      columns: ["Invoice", "Date & Time", "Customer", "Items", "Payment", "Total (Rs.)"],
      rows: filtered.map((o) => [
        o.invoiceNumber || "-",
        new Date(o.createdAt).toLocaleString(),
        o.customerPhone || "Walk-in",
        `${o.items?.length || 0} item(s)`,
        o.paymentMethod || "Cash",
        Number(o.grandTotal || 0).toLocaleString(),
      ]),
    });
  };

  return (
    <MainLayout>
      <style>{styles}</style>
      <div className="oh-wrap">
        <div className="oh-top">
          <div>
            <div className="oh-title">Order History</div>
            <div className="oh-sub">Track transactions, payment behavior, and customer-linked bills</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="oh-pdf" onClick={exportPdf}>Generate PDF</button>
            <button className="oh-refresh" onClick={fetchOrders}>Refresh</button>
          </div>
        </div>

        <div className="oh-grid">
          <div className="oh-card"><div className="oh-k">Orders</div><div className="oh-v">{stats.totalOrders}</div></div>
          <div className="oh-card"><div className="oh-k">Revenue</div><div className="oh-v">Rs. {stats.revenue.toLocaleString()}</div></div>
          <div className="oh-card"><div className="oh-k">Unpaid Bills</div><div className="oh-v">{stats.unpaid}</div></div>
          <div className="oh-card"><div className="oh-k">Average Ticket</div><div className="oh-v">Rs. {stats.avg.toLocaleString()}</div></div>
        </div>

        {error && <div style={{ color: "#ffb2bb", marginBottom: 10 }}>{error}</div>}

        <div className="oh-filters">
          <input
            className="oh-input"
            placeholder="Search by invoice, payment method, customer phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className="oh-select" value={payment} onChange={(e) => setPayment(e.target.value)}>
            <option value="All">All Payments</option>
            <option value="Cash">Cash</option>
            <option value="Card">Card</option>
            <option value="Travel Package">Travel Package</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Unpaid">Unpaid</option>
          </select>
          <select className="oh-select" value={range} onChange={(e) => setRange(e.target.value)}>
            <option value="All">All Time</option>
            <option value="Today">Today</option>
            <option value="This Week">This Week</option>
            <option value="This Month">This Month</option>
          </select>
          <input
            className="oh-input"
            type="datetime-local"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
          <input
            className="oh-input"
            type="datetime-local"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
          <button className="oh-refresh" style={{ width: "100%" }} onClick={() => { setSearch(""); setPayment("All"); setRange("All"); setFromDate(""); setToDate(""); }}>
            Clear Filters
          </button>
        </div>

        <div className="oh-tableWrap">
          <table className="oh-table">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Date & Time</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="oh-empty" colSpan="6">Loading orders...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td className="oh-empty" colSpan="6">No orders found</td></tr>
              ) : (
                filtered.map((order) => (
                  <tr key={order._id}>
                    <td>{order.invoiceNumber || "-"}</td>
                    <td>{order.customerPhone || "Walk-in"}</td>
                    <td>{order.items?.length || 0} item(s)</td>
                    <td className="oh-money">Rs. {(order.grandTotal || 0).toLocaleString()}</td>
                    <td>
                      <span className={`oh-badge ${payClass(order.paymentMethod)}`}>
                        {order.paymentMethod || "Cash"}
                      </span>
                    </td>
                    <td>{new Date(order.createdAt).toLocaleString()}</td>
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
