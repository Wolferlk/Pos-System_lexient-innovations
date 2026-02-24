import React, { useEffect, useState } from "react";
import axios from "axios";
import MainLayout from "../layout/MainLayout";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

  :root {
    --bg-base:     #0f1117;
    --bg-card:     #1a1d27;
    --bg-elevated: #22263a;
    --bg-hover:    #2a2f45;
    --accent:      #f5a623;
    --accent-dim:  rgba(245,166,35,0.13);
    --accent-glow: rgba(245,166,35,0.3);
    --success:     #22c55e;
    --success-dim: rgba(34,197,94,0.12);
    --danger:      #ef4444;
    --danger-dim:  rgba(239,68,68,0.1);
    --blue:        #3b82f6;
    --blue-dim:    rgba(59,130,246,0.12);
    --text-primary:#f0f2f8;
    --text-muted:  #6b7499;
    --text-dim:    #3d4263;
    --border:      rgba(255,255,255,0.06);
    --radius:      14px;
    --radius-sm:   8px;
    --font:        'Sora', sans-serif;
    --mono:        'JetBrains Mono', monospace;
  }

  .emp-root * { box-sizing: border-box; }
  .emp-root { font-family: var(--font); color: var(--text-primary); }

  .emp-page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 28px; }
  .emp-page-title { font-size: 24px; font-weight: 700; letter-spacing: -0.4px; }
  .emp-page-sub { font-size: 13px; color: var(--text-muted); margin-top: 3px; font-family: var(--mono); }
  .emp-stats { display: flex; gap: 12px; }
  .emp-stat-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 14px 20px; min-width: 120px; text-align: center; }
  .emp-stat-val { font-size: 22px; font-weight: 700; font-family: var(--mono); color: var(--accent); }
  .emp-stat-label { font-size: 11px; color: var(--text-muted); margin-top: 2px; text-transform: uppercase; letter-spacing: 0.8px; }

  .emp-form-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 24px; margin-bottom: 24px; }
  .emp-form-title { font-size: 14px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; font-family: var(--mono); margin-bottom: 18px; display: flex; align-items: center; gap: 8px; }
  .emp-form-title::before { content:''; display:block; width:3px; height:14px; background:var(--accent); border-radius:2px; }
  .emp-form-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
  .emp-field { display: flex; flex-direction: column; gap: 6px; }
  .emp-label { font-size: 11px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.8px; }
  .emp-input, .emp-select {
    background: var(--bg-elevated); border: 1px solid var(--border);
    color: var(--text-primary); font-family: var(--font); font-size: 13px;
    padding: 11px 14px; border-radius: var(--radius-sm); outline: none;
    transition: border-color .2s, box-shadow .2s; width: 100%;
  }
  .emp-input:focus, .emp-select:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-dim); }
  .emp-input::placeholder { color: var(--text-dim); }
  .emp-select option { background: var(--bg-elevated); color: var(--text-primary); }

  .emp-submit-btn {
    margin-top: 14px; width: 100%;
    background: var(--accent); color: #0f1117;
    font-family: var(--font); font-size: 14px; font-weight: 700;
    padding: 13px; border-radius: var(--radius-sm); border: none;
    cursor: pointer; transition: all .2s; box-shadow: 0 4px 14px var(--accent-glow);
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .emp-submit-btn:hover { filter: brightness(1.08); transform: translateY(-1px); }
  .emp-submit-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

  .emp-table-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }
  .emp-table-header { padding: 18px 24px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
  .emp-table-title { font-size: 14px; font-weight: 600; display: flex; align-items: center; gap: 8px; }
  .emp-table-count { background: var(--accent-dim); color: var(--accent); font-size: 11px; font-weight: 700; font-family: var(--mono); padding: 2px 9px; border-radius: 20px; border: 1px solid rgba(245,166,35,0.2); }
  .emp-search { background: var(--bg-elevated); border: 1px solid var(--border); color: var(--text-primary); font-family: var(--font); font-size: 13px; padding: 8px 14px; border-radius: var(--radius-sm); outline: none; width: 220px; transition: border-color .2s; }
  .emp-search:focus { border-color: var(--accent); }
  .emp-search::placeholder { color: var(--text-dim); }

  table.emp-table { width: 100%; border-collapse: collapse; }
  .emp-table thead tr { background: var(--bg-elevated); }
  .emp-table th { padding: 12px 20px; text-align: left; font-size: 11px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; font-family: var(--mono); }
  .emp-table tbody tr { border-top: 1px solid var(--border); transition: background .15s; }
  .emp-table tbody tr:hover { background: var(--bg-hover); }
  .emp-table td { padding: 14px 20px; font-size: 13px; }

  .emp-name-cell { display: flex; align-items: center; gap: 10px; }
  .emp-avatar { width: 34px; height: 34px; border-radius: 10px; background: var(--accent-dim); border: 1px solid rgba(245,166,35,0.2); display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; color: var(--accent); flex-shrink: 0; font-family: var(--mono); }
  .emp-name { font-weight: 600; font-size: 13px; }
  .emp-empid { font-size: 10px; color: var(--text-dim); font-family: var(--mono); }

  .emp-role-badge { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
  .role-Chef    { background: rgba(249,115,22,0.12); color: #f97316; border: 1px solid rgba(249,115,22,0.2); }
  .role-Cashier { background: var(--blue-dim); color: var(--blue); border: 1px solid rgba(59,130,246,0.2); }
  .role-Manager { background: var(--accent-dim); color: var(--accent); border: 1px solid rgba(245,166,35,0.2); }
  .role-Waiter  { background: var(--success-dim); color: var(--success); border: 1px solid rgba(34,197,94,0.2); }

  .emp-salary { font-family: var(--mono); font-size: 13px; color: var(--accent); font-weight: 500; }
  .emp-att-wrap { display: flex; align-items: center; gap: 8px; }
  .emp-att-btn { width: 24px; height: 24px; border-radius: 6px; border: 1px solid var(--border); background: var(--bg-elevated); color: var(--text-primary); font-size: 13px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all .15s; }
  .emp-att-btn:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-dim); }
  .emp-att-val { font-family: var(--mono); font-size: 13px; font-weight: 600; min-width: 28px; text-align: center; }
  .emp-att-days { font-size: 11px; color: var(--text-muted); }
  .emp-net { font-family: var(--mono); font-size: 13px; font-weight: 600; color: var(--success); }

  .emp-action-btn { width: 32px; height: 32px; border-radius: 8px; border: 1px solid var(--border); background: transparent; font-size: 15px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all .15s; }
  .emp-action-btn.edit:hover { background: var(--blue-dim); border-color: rgba(59,130,246,0.3); }

  .emp-empty { text-align: center; padding: 48px; color: var(--text-muted); font-size: 13px; }
  .emp-empty-icon { font-size: 36px; opacity: 0.3; margin-bottom: 8px; }

  /* ── MODAL ── */
  .emp-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.75); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; z-index: 200; animation: fade-in .2s ease; }
  @keyframes fade-in { from{opacity:0}to{opacity:1} }
  .emp-modal { background: var(--bg-card); border: 1px solid rgba(245,166,35,0.25); border-radius: 20px; width: 500px; padding: 32px; animation: pop-in .25s cubic-bezier(.34,1.56,.64,1); box-shadow: 0 30px 80px rgba(0,0,0,0.6); }
  @keyframes pop-in { from{opacity:0;transform:scale(0.88) translateY(20px)}to{opacity:1;transform:scale(1) translateY(0)} }

  .emp-modal-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; }
  .emp-modal-title { font-size: 18px; font-weight: 700; letter-spacing: -0.3px; }
  .emp-modal-sub { font-size: 12px; color: var(--text-muted); margin-top: 3px; font-family: var(--mono); }
  .emp-modal-close { width: 32px; height: 32px; border-radius: 8px; border: 1px solid var(--border); background: transparent; color: var(--text-muted); font-size: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all .15s; line-height:1; }
  .emp-modal-close:hover { background: var(--danger-dim); color: var(--danger); border-color: rgba(239,68,68,0.2); }

  .emp-modal-section { font-size: 11px; font-weight: 600; color: var(--text-dim); text-transform: uppercase; letter-spacing: 1px; font-family: var(--mono); margin: 0 0 14px; display: flex; align-items: center; gap: 8px; }
  .emp-modal-section::after { content:''; flex:1; height:1px; background:var(--border); }

  .emp-modal-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 20px; }
  .emp-modal-grid .full { grid-column: 1 / -1; }

  .emp-net-display { background: var(--success-dim); border: 1px solid rgba(34,197,94,0.2); border-radius: var(--radius-sm); padding: 11px 14px; font-family: var(--mono); font-weight: 700; color: var(--success); font-size: 16px; }

  .emp-modal-actions { display: flex; gap: 10px; margin-top: 24px; }
  .emp-modal-btn { flex: 1; padding: 13px; border-radius: var(--radius-sm); border: none; font-family: var(--font); font-size: 14px; font-weight: 600; cursor: pointer; transition: all .18s; }
  .emp-modal-btn.save { background: var(--accent); color: #0f1117; box-shadow: 0 4px 12px var(--accent-glow); }
  .emp-modal-btn.save:hover { filter: brightness(1.08); transform: translateY(-1px); }
  .emp-modal-btn.save:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
  .emp-modal-btn.cancel { background: var(--bg-elevated); color: var(--text-muted); border: 1px solid var(--border); }
  .emp-modal-btn.cancel:hover { color: var(--text-primary); }

  .emp-toast { position: fixed; bottom: 28px; right: 28px; z-index: 999; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 14px 20px; font-size: 13px; font-weight: 500; color: var(--text-primary); box-shadow: 0 10px 30px rgba(0,0,0,0.5); animation: toast-in .25s cubic-bezier(.34,1.56,.64,1); display: flex; align-items: center; gap: 10px; }
  @keyframes toast-in { from{opacity:0;transform:translateY(16px) scale(0.95)}to{opacity:1;transform:translateY(0) scale(1)} }
  .emp-toast.success { border-color: rgba(34,197,94,0.3); }
  .emp-toast.error   { border-color: rgba(239,68,68,0.3); }
`;

const ROLES = ["Chef", "Cashier", "Manager", "Waiter"];
const ROLE_ICONS = { Chef: "👨‍🍳", Cashier: "💳", Manager: "👔", Waiter: "🍽️" };

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, []);
  return <div className={`emp-toast ${type}`}><span>{type === "success" ? "✅" : "❌"}</span>{msg}</div>;
}

function EditModal({ emp, onClose, onSaved, token, showToast }) {
  const [form, setForm] = useState({
    name: emp.name,
    role: emp.role,
    basicSalary: emp.basicSalary,
    attendanceDays: emp.attendanceDays ?? 0,
  });
  const [saving, setSaving] = useState(false);
  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const netSalary = Math.round((Number(form.basicSalary) / 30) * Number(form.attendanceDays));

  const handleSave = async () => {
    if (!form.name.trim()) return showToast("Name is required", "error");
    if (!form.basicSalary || form.basicSalary < 1) return showToast("Enter a valid salary", "error");
    setSaving(true);
    try {
      await axios.put(
        `http://localhost:5000/api/employees/${emp._id}`,
        { name: form.name, role: form.role, basicSalary: Number(form.basicSalary) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await axios.put(
        `http://localhost:5000/api/employees/${emp._id}/attendance`,
        { attendanceDays: Number(form.attendanceDays) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast(`${form.name} updated successfully`);
      onSaved();
      onClose();
    } catch {
      showToast("Failed to update employee", "error");
    }
    setSaving(false);
  };

  return (
    <div className="emp-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="emp-modal">

        <div className="emp-modal-header">
          <div>
            <div className="emp-modal-title">✏️ Edit Employee</div>
            <div className="emp-modal-sub">ID: #{emp._id.slice(-6).toUpperCase()}</div>
          </div>
          <button className="emp-modal-close" onClick={onClose}>×</button>
        </div>

        {/* Personal Info */}
        <div className="emp-modal-section">Personal Info</div>
        <div className="emp-modal-grid">
          <div className="emp-field full">
            <label className="emp-label">Full Name</label>
            <input className="emp-input" value={form.name} placeholder="Employee name" onChange={(e) => set("name", e.target.value)} />
          </div>
          <div className="emp-field">
            <label className="emp-label">Role</label>
            <select className="emp-select" value={form.role} onChange={(e) => set("role", e.target.value)}>
              {ROLES.map((r) => <option key={r} value={r}>{ROLE_ICONS[r]} {r}</option>)}
            </select>
          </div>
          <div className="emp-field">
            <label className="emp-label">Basic Salary (Rs.)</label>
            <input className="emp-input" type="number" min={1} value={form.basicSalary} onChange={(e) => set("basicSalary", e.target.value)} />
          </div>
        </div>

        {/* Attendance */}
        <div className="emp-modal-section">Attendance & Payroll</div>
        <div className="emp-modal-grid">
          <div className="emp-field">
            <label className="emp-label">Attendance Days (0–30)</label>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button className="emp-att-btn" onClick={() => set("attendanceDays", Math.max(0, Number(form.attendanceDays) - 1))}>−</button>
              <input
                className="emp-input" type="number" min={0} max={30}
                value={form.attendanceDays}
                onChange={(e) => set("attendanceDays", Math.min(30, Math.max(0, Number(e.target.value))))}
                style={{ textAlign: "center", fontFamily: "var(--mono)", fontWeight: 700 }}
              />
              <button className="emp-att-btn" onClick={() => set("attendanceDays", Math.min(30, Number(form.attendanceDays) + 1))}>+</button>
            </div>
          </div>
          <div className="emp-field">
            <label className="emp-label">Net Salary (Auto-calculated)</label>
            <div className="emp-net-display">Rs. {netSalary.toLocaleString()}</div>
          </div>
        </div>

        <div className="emp-modal-actions">
          <button className="emp-modal-btn cancel" onClick={onClose}>Cancel</button>
          <button className="emp-modal-btn save" onClick={handleSave} disabled={saving}>
            {saving ? "⏳ Saving..." : "💾 Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", role: "Cashier", basicSalary: "" });
  const [editTarget, setEditTarget] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => { fetchEmployees(); }, []);
  useEffect(() => {
    if (!search.trim()) { setFiltered(employees); return; }
    const q = search.toLowerCase();
    setFiltered(employees.filter((e) => e.name.toLowerCase().includes(q) || e.role.toLowerCase().includes(q)));
  }, [search, employees]);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/employees", { headers: { Authorization: `Bearer ${token}` } });
      setEmployees(res.data);
    } catch { showToast("Failed to load employees", "error"); }
  };

  const showToast = (msg, type = "success") => setToast({ msg, type });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(
        "http://localhost:5000/api/employees",
        { name: form.name, role: form.role, basicSalary: Number(form.basicSalary) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setForm({ name: "", role: "Cashier", basicSalary: "" });
      fetchEmployees();
      showToast(`${form.name} added successfully`);
    } catch { showToast("Failed to add employee", "error"); }
    setLoading(false);
  };

  const updateAttendance = async (emp, delta) => {
    const newDays = Math.max(0, Math.min(30, (emp.attendanceDays || 0) + delta));
    try {
      await axios.put(
        `http://localhost:5000/api/employees/${emp._id}/attendance`,
        { attendanceDays: newDays },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEmployees((prev) => prev.map((e) => e._id === emp._id ? { ...e, attendanceDays: newDays } : e));
    } catch { showToast("Failed to update attendance", "error"); }
  };

  const calcNet = (emp) => Math.round((emp.basicSalary / 30) * (emp.attendanceDays || 0));
  const totalPayroll = employees.reduce((s, e) => s + calcNet(e), 0);

  return (
    <MainLayout>
      <style>{styles}</style>
      <div className="emp-root">

        {/* Header */}
        <div className="emp-page-header">
          <div>
            <div className="emp-page-title">👨‍💼 Employee Management</div>
            <div className="emp-page-sub">Manage staff, roles & attendance</div>
          </div>
          <div className="emp-stats">
            <div className="emp-stat-card">
              <div className="emp-stat-val">{employees.length}</div>
              <div className="emp-stat-label">Total Staff</div>
            </div>
            <div className="emp-stat-card">
              <div className="emp-stat-val" style={{ color: "var(--success)" }}>Rs. {totalPayroll.toLocaleString()}</div>
              <div className="emp-stat-label">Est. Payroll</div>
            </div>
          </div>
        </div>

        {/* Add Form */}
        <div className="emp-form-card">
          <div className="emp-form-title">Add New Employee</div>
          <form onSubmit={handleSubmit}>
            <div className="emp-form-grid">
              <div className="emp-field">
                <label className="emp-label">Full Name</label>
                <input className="emp-input" placeholder="e.g. Ashan Perera" value={form.name} required onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="emp-field">
                <label className="emp-label">Role</label>
                <select className="emp-select" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  {ROLES.map((r) => <option key={r} value={r}>{ROLE_ICONS[r]} {r}</option>)}
                </select>
              </div>
              <div className="emp-field">
                <label className="emp-label">Basic Salary (Rs.)</label>
                <input className="emp-input" type="number" placeholder="e.g. 45000" value={form.basicSalary} required min={1} onChange={(e) => setForm({ ...form, basicSalary: e.target.value })} />
              </div>
            </div>
            <button className="emp-submit-btn" type="submit" disabled={loading}>
              {loading ? "⏳ Adding..." : "＋ Add Employee"}
            </button>
          </form>
        </div>

        {/* Table */}
        <div className="emp-table-card">
          <div className="emp-table-header">
            <div className="emp-table-title">Staff List <span className="emp-table-count">{filtered.length}</span></div>
            <input className="emp-search" placeholder="🔍 Search name or role..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <table className="emp-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Role</th>
                <th>Basic Salary</th>
                <th>Attendance</th>
                <th>Net Salary</th>
                <th>Edit</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6}><div className="emp-empty"><div className="emp-empty-icon">👥</div><div>No employees found</div></div></td></tr>
              ) : filtered.map((emp) => (
                <tr key={emp._id}>
                  <td>
                    <div className="emp-name-cell">
                      <div className="emp-avatar">{emp.name.charAt(0).toUpperCase()}</div>
                      <div>
                        <div className="emp-name">{emp.name}</div>
                        <div className="emp-empid">#{emp._id.slice(-6).toUpperCase()}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className={`emp-role-badge role-${emp.role}`}>{ROLE_ICONS[emp.role]} {emp.role}</span></td>
                  <td><span className="emp-salary">Rs. {emp.basicSalary.toLocaleString()}</span></td>
                  <td>
                    <div className="emp-att-wrap">
                      <button className="emp-att-btn" onClick={() => updateAttendance(emp, -1)}>−</button>
                      <span className="emp-att-val">{emp.attendanceDays}</span>
                      <button className="emp-att-btn" onClick={() => updateAttendance(emp, 1)}>+</button>
                      <span className="emp-att-days">/ 30</span>
                    </div>
                  </td>
                  <td><span className="emp-net">Rs. {calcNet(emp).toLocaleString()}</span></td>
                  <td>
                    <button className="emp-action-btn edit" title="Edit all details" onClick={() => setEditTarget(emp)}>✏️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Edit Modal */}
        {editTarget && (
          <EditModal
            emp={editTarget}
            token={token}
            showToast={showToast}
            onClose={() => setEditTarget(null)}
            onSaved={fetchEmployees}
          />
        )}

        {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    </MainLayout>
  );
}