import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import MainLayout from "../layout/MainLayout";

const styles = `
  .us-wrap { color:#e8ecff; }
  .us-top { display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; gap:12px; flex-wrap:wrap; }
  .us-title { font-size:30px; font-weight:800; letter-spacing:-.4px; }
  .us-sub { color:#8d97be; font-size:13px; margin-top:4px; }
  .us-refresh { background:#f5a623; color:#111; border:none; border-radius:10px; padding:10px 14px; font-weight:700; cursor:pointer; }
  .us-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:10px; margin-bottom:14px; }
  .us-card { background:rgba(19,23,36,.8); border:1px solid rgba(255,255,255,.08); border-radius:12px; padding:12px; }
  .us-k { color:#8d97be; font-size:12px; }
  .us-v { font-size:24px; font-weight:800; margin-top:4px; }
  .us-filters { display:grid; grid-template-columns:2fr 1fr 1fr; gap:10px; margin-bottom:12px; }
  .us-input, .us-select { width:100%; background:#171c2c; border:1px solid rgba(255,255,255,.09); color:#e8ecff; border-radius:10px; padding:11px 12px; }
  .us-tableWrap { background:rgba(19,23,36,.8); border:1px solid rgba(255,255,255,.08); border-radius:12px; overflow:auto; }
  .us-table { width:100%; border-collapse:collapse; min-width:920px; }
  .us-table th { text-align:left; color:#8d97be; font-size:12px; font-weight:700; padding:12px; border-bottom:1px solid rgba(255,255,255,.08); text-transform:uppercase; letter-spacing:.8px; }
  .us-table td { padding:12px; border-top:1px solid rgba(255,255,255,.06); }
  .us-badge { display:inline-block; padding:4px 8px; border-radius:999px; font-size:11px; font-weight:700; }
  .us-active { background:rgba(34,197,94,.16); color:#86efac; }
  .us-term { background:rgba(239,68,68,.16); color:#fca5a5; }
  .us-rolea { background:rgba(245,166,35,.16); color:#fcd38d; }
  .us-rolec { background:rgba(59,130,246,.16); color:#93c5fd; }
  .us-btn { border:none; border-radius:8px; padding:7px 10px; font-weight:700; cursor:pointer; margin-right:7px; }
  .us-reset { background:#1d4f91; color:#b9d8ff; }
  .us-termBtn { background:#5b1f2a; color:#ff8f9f; }
  .us-muted { color:#8d97be; text-align:center; padding:24px; }
  .us-modalWrap { position:fixed; inset:0; background:rgba(0,0,0,.72); display:flex; align-items:center; justify-content:center; z-index:2500; }
  .us-modal { width:420px; max-width:92vw; background:#101525; border:1px solid rgba(255,255,255,.1); border-radius:14px; padding:16px; }
  .us-modalTitle { font-size:18px; font-weight:700; margin-bottom:6px; }
  .us-modalSub { color:#8d97be; font-size:13px; margin-bottom:12px; }
  .us-row { display:flex; gap:8px; justify-content:flex-end; margin-top:12px; }
  .us-modalBtn { border:none; border-radius:9px; padding:9px 12px; font-weight:700; cursor:pointer; }
  .us-cancel { background:#1d2336; color:#9ea7cc; }
  .us-confirm { background:#f5a623; color:#111; }
  @media (max-width:900px){ .us-filters { grid-template-columns:1fr; } }
`;

export default function Users() {
  const token = localStorage.getItem("token");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [resetUser, setResetUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get("http://localhost:5000/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data || []);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const terminateUser = async (id) => {
    if (!window.confirm("Terminate this user account?")) return;
    try {
      await axios.put(
        `http://localhost:5000/api/users/${id}/terminate`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchUsers();
    } catch (e) {
      alert(e.response?.data?.message || "Failed to terminate user");
    }
  };

  const submitResetPassword = async () => {
    if (!resetUser || !newPassword.trim()) return;
    try {
      await axios.put(
        `http://localhost:5000/api/users/${resetUser._id}/password`,
        { password: newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResetUser(null);
      setNewPassword("");
      alert("Password updated");
    } catch (e) {
      alert(e.response?.data?.message || "Failed to reset password");
    }
  };

  const filtered = useMemo(() => {
    let data = [...users];
    const q = search.trim().toLowerCase();
    if (q) {
      data = data.filter(
        (u) =>
          (u.name || "").toLowerCase().includes(q) ||
          (u.email || "").toLowerCase().includes(q)
      );
    }
    if (roleFilter !== "All") data = data.filter((u) => u.role === roleFilter);
    if (statusFilter !== "All") {
      data = data.filter((u) => (statusFilter === "Active" ? u.isActive : !u.isActive));
    }
    data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return data;
  }, [users, search, roleFilter, statusFilter]);

  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.isActive).length;
    const admins = users.filter((u) => u.role === "admin").length;
    const cashiers = users.filter((u) => u.role === "cashier").length;
    return { total, active, admins, cashiers };
  }, [users]);

  return (
    <MainLayout>
      <style>{styles}</style>
      <div className="us-wrap">
        <div className="us-top">
          <div>
            <div className="us-title">User Management</div>
            <div className="us-sub">Manage access, account health, and credential security</div>
          </div>
          <button className="us-refresh" onClick={fetchUsers}>Refresh</button>
        </div>

        <div className="us-grid">
          <div className="us-card"><div className="us-k">Total Users</div><div className="us-v">{stats.total}</div></div>
          <div className="us-card"><div className="us-k">Active Users</div><div className="us-v">{stats.active}</div></div>
          <div className="us-card"><div className="us-k">Admins</div><div className="us-v">{stats.admins}</div></div>
          <div className="us-card"><div className="us-k">Cashiers</div><div className="us-v">{stats.cashiers}</div></div>
        </div>

        {error && <div style={{ color: "#ffb2bb", marginBottom: 10 }}>{error}</div>}

        <div className="us-filters">
          <input
            className="us-input"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className="us-select" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="All">All Roles</option>
            <option value="admin">Admin</option>
            <option value="cashier">Cashier</option>
          </select>
          <select className="us-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Terminated">Terminated</option>
          </select>
        </div>

        <div className="us-tableWrap">
          <table className="us-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="us-muted">Loading users...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="6" className="us-muted">No users found</td></tr>
              ) : (
                filtered.map((user) => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`us-badge ${user.role === "admin" ? "us-rolea" : "us-rolec"}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <span className={`us-badge ${user.isActive ? "us-active" : "us-term"}`}>
                        {user.isActive ? "Active" : "Terminated"}
                      </span>
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button className="us-btn us-reset" onClick={() => { setResetUser(user); setNewPassword(""); }}>
                        Reset Password
                      </button>
                      {user.isActive && (
                        <button className="us-btn us-termBtn" onClick={() => terminateUser(user._id)}>
                          Terminate
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {resetUser && (
          <div className="us-modalWrap">
            <div className="us-modal">
              <div className="us-modalTitle">Reset Password</div>
              <div className="us-modalSub">{resetUser.name} ({resetUser.email})</div>
              <input
                className="us-input"
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <div className="us-row">
                <button className="us-modalBtn us-cancel" onClick={() => setResetUser(null)}>Cancel</button>
                <button className="us-modalBtn us-confirm" onClick={submitResetPassword}>Update Password</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
