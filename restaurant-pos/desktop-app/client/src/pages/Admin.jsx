import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import MainLayout from "../layout/MainLayout";

const styles = `
  .ad-wrap { color:#e8ecff; }
  .ad-top { display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:14px; flex-wrap:wrap; }
  .ad-title { font-size:32px; font-weight:800; letter-spacing:-.6px; }
  .ad-sub { color:#8d97be; font-size:13px; margin-top:4px; }
  .ad-actions { display:flex; gap:8px; flex-wrap:wrap; }
  .ad-btn { border:none; border-radius:10px; padding:10px 14px; font-weight:700; cursor:pointer; }
  .ad-refresh { background:#f5a623; color:#111; }
  .ad-sync { background:#2563eb; color:#fff; }
  .ad-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:10px; margin-bottom:14px; }
  .ad-card { background:rgba(19,23,36,.8); border:1px solid rgba(255,255,255,.08); border-radius:12px; padding:14px; }
  .ad-k { color:#8d97be; font-size:12px; }
  .ad-v { font-size:26px; font-weight:800; margin-top:5px; }
  .ad-pill { display:inline-block; margin-top:8px; padding:4px 8px; border-radius:999px; font-size:11px; font-weight:700; }
  .ad-green { background:rgba(34,197,94,.16); color:#86efac; }
  .ad-red { background:rgba(239,68,68,.16); color:#fca5a5; }
  .ad-yellow { background:rgba(245,166,35,.16); color:#fcd38d; }
  .ad-sections { display:grid; grid-template-columns:1.3fr 1fr; gap:12px; }
  .ad-block { background:rgba(19,23,36,.8); border:1px solid rgba(255,255,255,.08); border-radius:12px; padding:14px; }
  .ad-head { font-size:14px; font-weight:700; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center; }
  .ad-list { display:flex; flex-direction:column; gap:8px; }
  .ad-row { display:flex; justify-content:space-between; gap:8px; padding:8px; border-radius:9px; background:rgba(255,255,255,.02); border:1px solid rgba(255,255,255,.05); }
  .ad-rowL { color:#dbe3ff; font-size:13px; }
  .ad-rowS { color:#8d97be; font-size:11px; margin-top:2px; }
  .ad-rowR { color:#e8ecff; font-weight:700; font-size:12px; text-align:right; white-space:nowrap; }
  .ad-quick { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:8px; }
  .ad-qbtn { border:1px solid rgba(255,255,255,.1); background:#171c2c; color:#e8ecff; padding:10px 12px; border-radius:10px; text-align:left; cursor:pointer; font-weight:600; }
  .ad-qbtn:hover { border-color:rgba(245,166,35,.45); color:#fcd38d; }
  .ad-err { margin-bottom:12px; background:rgba(239,68,68,.14); border:1px solid rgba(239,68,68,.32); color:#ffb2bb; border-radius:10px; padding:10px 12px; font-size:13px; }
  .ad-muted { color:#8d97be; font-size:12px; }
  .ad-link { color:#7eb6ff; cursor:pointer; }
  @media (max-width:980px) { .ad-sections { grid-template-columns:1fr; } .ad-quick{grid-template-columns:1fr;} }
`;

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

export default function Admin() {
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [syncMsg, setSyncMsg] = useState("");

  const [orders, setOrders] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [users, setUsers] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [logs, setLogs] = useState([]);
  const [offlineStatus, setOfflineStatus] = useState({ cloudConnected: false, pendingOrders: 0 });

  const fetchDashboard = async () => {
    setLoading(true);
    setError("");
    setSyncMsg("");
    try {
      const results = await Promise.allSettled([
        axios.get("http://localhost:5000/api/orders", { headers }),
        axios.get("http://localhost:5000/api/expenses", { headers }),
        axios.get("http://localhost:5000/api/users", { headers }),
        axios.get("http://localhost:5000/api/inventory/low-stock", { headers }),
        axios.get("http://localhost:5000/api/logs?limit=8", { headers }),
        axios.get("http://localhost:5000/api/offline/status", { headers }),
      ]);

      if (results[0].status === "fulfilled") setOrders(results[0].value.data || []);
      if (results[1].status === "fulfilled") setExpenses(results[1].value.data || []);
      if (results[2].status === "fulfilled") setUsers(results[2].value.data || []);
      if (results[3].status === "fulfilled") setLowStock(results[3].value.data || []);
      if (results[4].status === "fulfilled") setLogs(results[4].value.data?.logs || []);
      if (results[5].status === "fulfilled") setOfflineStatus(results[5].value.data || { cloudConnected: false, pendingOrders: 0 });

      const failed = results.filter((r) => r.status === "rejected").length;
      if (failed > 0) setError(`Some dashboard widgets could not load (${failed}). Showing available data.`);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const runOfflineSync = async () => {
    setSyncMsg("");
    try {
      const res = await axios.post("http://localhost:5000/api/offline/sync", {}, { headers });
      setSyncMsg(`Synced ${res.data.synced}, skipped ${res.data.skipped}, pending ${res.data.pending}`);
      fetchDashboard();
    } catch (e) {
      setSyncMsg(e.response?.data?.message || "Sync failed");
    }
  };

  const stats = useMemo(() => {
    const today = startOfToday();

    const todaysOrders = orders.filter((o) => new Date(o.createdAt) >= today);
    const todaysSales = todaysOrders.reduce((sum, o) => sum + Number(o.grandTotal || 0), 0);

    const monthNow = new Date();
    const monthSales = orders
      .filter((o) => {
        const d = new Date(o.createdAt);
        return d.getMonth() === monthNow.getMonth() && d.getFullYear() === monthNow.getFullYear();
      })
      .reduce((sum, o) => sum + Number(o.grandTotal || 0), 0);

    const todayExpense = expenses
      .filter((e) => new Date(e.expenseDate) >= today)
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);

    const activeUsers = users.filter((u) => u.isActive).length;
    const unpaid = orders.filter((o) => o.paymentMethod === "Unpaid").length;

    return {
      todaysOrders: todaysOrders.length,
      todaysSales,
      monthSales,
      todayExpense,
      activeUsers,
      lowStockCount: lowStock.length,
      unpaid,
    };
  }, [orders, expenses, users, lowStock]);

  const recentOrders = useMemo(
    () => [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6),
    [orders]
  );

  return (
    <MainLayout>
      <style>{styles}</style>
      <div className="ad-wrap">
        <div className="ad-top">
          <div>
            <div className="ad-title">Admin Control Center</div>
            <div className="ad-sub">Operations, sales, risk signals, and sync health in one place</div>
          </div>
          <div className="ad-actions">
            <button className="ad-btn ad-sync" onClick={runOfflineSync}>Sync Offline Data</button>
            <button className="ad-btn ad-refresh" onClick={fetchDashboard}>Refresh</button>
          </div>
        </div>

        {error && <div className="ad-err">{error}</div>}
        {syncMsg && <div className="ad-err" style={{ borderColor: "rgba(59,130,246,.35)", background: "rgba(59,130,246,.14)", color: "#b9d7ff" }}>{syncMsg}</div>}

        <div className="ad-grid">
          <div className="ad-card">
            <div className="ad-k">Today Sales</div>
            <div className="ad-v">Rs. {stats.todaysSales.toLocaleString()}</div>
            <span className="ad-pill ad-green">{stats.todaysOrders} orders today</span>
          </div>
          <div className="ad-card">
            <div className="ad-k">This Month Sales</div>
            <div className="ad-v">Rs. {stats.monthSales.toLocaleString()}</div>
            <span className="ad-pill ad-yellow">{orders.length} total orders</span>
          </div>
          <div className="ad-card">
            <div className="ad-k">Today Expenses</div>
            <div className="ad-v">Rs. {stats.todayExpense.toLocaleString()}</div>
            <span className="ad-pill ad-yellow">{expenses.length} expense entries</span>
          </div>
          <div className="ad-card">
            <div className="ad-k">System Health</div>
            <div className="ad-v">{offlineStatus.cloudConnected ? "Online" : "Offline"}</div>
            <span className={`ad-pill ${offlineStatus.cloudConnected ? "ad-green" : "ad-red"}`}>
              {offlineStatus.pendingOrders || 0} pending sync
            </span>
          </div>
          <div className="ad-card">
            <div className="ad-k">Low Stock Alerts</div>
            <div className="ad-v">{stats.lowStockCount}</div>
            <span className={`ad-pill ${stats.lowStockCount > 0 ? "ad-red" : "ad-green"}`}>
              {stats.lowStockCount > 0 ? "Action required" : "Healthy"}
            </span>
          </div>
          <div className="ad-card">
            <div className="ad-k">Users / Unpaid</div>
            <div className="ad-v">{stats.activeUsers} / {stats.unpaid}</div>
            <span className="ad-pill ad-yellow">Active users / unpaid bills</span>
          </div>
        </div>

        <div className="ad-sections">
          <div className="ad-block">
            <div className="ad-head">
              <span>Recent Orders</span>
              <span className="ad-link" onClick={() => navigate("/admin/orders")}>View all</span>
            </div>
            <div className="ad-list">
              {loading ? (
                <div className="ad-muted">Loading recent orders...</div>
              ) : recentOrders.length === 0 ? (
                <div className="ad-muted">No orders yet.</div>
              ) : (
                recentOrders.map((o) => (
                  <div key={o._id} className="ad-row">
                    <div>
                      <div className="ad-rowL">#{o.invoiceNumber || "N/A"}</div>
                      <div className="ad-rowS">{new Date(o.createdAt).toLocaleString()}</div>
                    </div>
                    <div className="ad-rowR">
                      Rs. {Number(o.grandTotal || 0).toLocaleString()}
                      <div className="ad-rowS">{o.paymentMethod || "Cash"}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="ad-block">
            <div className="ad-head">
              <span>Low Stock Alerts</span>
              <span className="ad-link" onClick={() => navigate("/admin/items")}>Manage</span>
            </div>
            <div className="ad-list">
              {loading ? (
                <div className="ad-muted">Loading stock status...</div>
              ) : lowStock.length === 0 ? (
                <div className="ad-muted">All inventory levels are healthy.</div>
              ) : (
                lowStock.slice(0, 6).map((item) => (
                  <div key={item._id} className="ad-row">
                    <div>
                      <div className="ad-rowL">{item.name}</div>
                      <div className="ad-rowS">{item.unit || "unit"}</div>
                    </div>
                    <div className="ad-rowR">{item.quantity}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="ad-block">
            <div className="ad-head">
              <span>Quick Actions</span>
            </div>
            <div className="ad-quick">
              <button className="ad-qbtn" onClick={() => navigate("/admin/reports")}>Open Reports</button>
              <button className="ad-qbtn" onClick={() => navigate("/admin/expenses")}>Add Expense</button>
              <button className="ad-qbtn" onClick={() => navigate("/admin/customers")}>Customer Desk</button>
              <button className="ad-qbtn" onClick={() => navigate("/admin/users")}>User Management</button>
              <button className="ad-qbtn" onClick={() => navigate("/admin/audit-logs")}>Audit Logs</button>
              <button className="ad-qbtn" onClick={() => navigate("/admin/register-user")}>Register User</button>
            </div>
          </div>

          <div className="ad-block">
            <div className="ad-head">
              <span>Recent Audit Events</span>
              <span className="ad-link" onClick={() => navigate("/admin/audit-logs")}>Open logs</span>
            </div>
            <div className="ad-list">
              {loading ? (
                <div className="ad-muted">Loading audit activity...</div>
              ) : logs.length === 0 ? (
                <div className="ad-muted">No recent activity.</div>
              ) : (
                logs.slice(0, 6).map((log) => (
                  <div key={log._id} className="ad-row">
                    <div>
                      <div className="ad-rowL">{log.task || log.action || "-"}</div>
                      <div className="ad-rowS">{log.userName || "Unknown"} · {new Date(log.createdAt).toLocaleString()}</div>
                    </div>
                    <div className="ad-rowR">{log.status || "SUCCESS"}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
