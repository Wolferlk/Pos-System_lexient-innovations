import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import MainLayout from "../layout/MainLayout";

const styles = `
  :root {
    --ca-bg: #0f1117;
    --ca-card: #1a1d27;
    --ca-elevated: #22263a;
    --ca-border: rgba(255,255,255,0.08);
    --ca-text: #eef2ff;
    --ca-muted: #94a3b8;
    --ca-accent: #f5a623;
    --ca-present: #22c55e;
    --ca-half: #3b82f6;
    --ca-absent: #ef4444;
  }

  .ca-root { color: var(--ca-text); }
  .ca-head { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:16px; flex-wrap:wrap; }
  .ca-title { font-size: 24px; font-weight: 700; }
  .ca-sub { font-size: 12px; color: var(--ca-muted); margin-top: 3px; }
  .ca-controls { display:flex; gap:8px; align-items:center; flex-wrap: wrap; }
  .ca-input {
    background: var(--ca-card); border: 1px solid var(--ca-border); color: var(--ca-text);
    border-radius: 10px; padding: 9px 12px; font-size: 13px; outline:none;
  }
  .ca-btn {
    border: 1px solid var(--ca-border); background: var(--ca-card); color: var(--ca-text);
    border-radius: 10px; padding: 9px 12px; font-size: 13px; font-weight: 600; cursor:pointer;
  }
  .ca-btn:hover { border-color: rgba(245,166,35,0.35); color: var(--ca-accent); }
  .ca-summary { display:grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap:10px; margin-bottom:14px; }
  .ca-stat { background: var(--ca-card); border:1px solid var(--ca-border); border-radius: 12px; padding: 12px; }
  .ca-stat-k { font-size: 11px; color: var(--ca-muted); text-transform: uppercase; }
  .ca-stat-v { margin-top: 6px; font-size: 20px; font-weight: 700; }
  .ca-list { background: var(--ca-card); border:1px solid var(--ca-border); border-radius: 14px; overflow: hidden; }
  .ca-row { display:grid; grid-template-columns: 2fr 1fr 2fr; align-items:center; gap:10px; padding: 12px 14px; border-top: 1px solid var(--ca-border); }
  .ca-row:first-child { border-top: none; }
  .ca-name { font-weight: 600; }
  .ca-role { font-size: 12px; color: var(--ca-muted); margin-top: 2px; }
  .ca-status { font-size: 12px; color: var(--ca-muted); }
  .ca-actions { display:flex; gap:6px; justify-content:flex-end; }
  .ca-mark { border:none; border-radius: 8px; padding: 7px 10px; font-size: 12px; font-weight: 700; cursor:pointer; color: #fff; }
  .ca-mark.present { background: var(--ca-present); }
  .ca-mark.half { background: var(--ca-half); }
  .ca-mark.absent { background: var(--ca-absent); }
  .ca-mark:disabled { opacity: 0.45; cursor: not-allowed; }
`;

const todayKey = () => new Date().toISOString().slice(0, 10);

export default function CashierAttendance() {
  const token = localStorage.getItem("token");
  const [date, setDate] = useState(todayKey());
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState("");

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const month = String(date || todayKey()).slice(0, 7);
      const res = await axios.get("http://localhost:5000/api/employees", {
        headers: { Authorization: `Bearer ${token}` },
        params: { month, workingDays: 30 },
      });
      setEmployees(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [date]);

  const getStatus = (emp) => {
    const rec = (emp.attendanceRecords || []).find((r) => r.dateKey === date);
    return rec?.status || "Not Marked";
  };

  const counts = useMemo(() => {
    const result = { total: employees.length, present: 0, half: 0, absent: 0 };
    for (const emp of employees) {
      const status = getStatus(emp);
      if (status === "Present") result.present += 1;
      if (status === "Half") result.half += 1;
      if (status === "Absent") result.absent += 1;
    }
    return result;
  }, [employees, date]);

  const mark = async (employeeId, status) => {
    setSavingId(employeeId);
    try {
      await axios.post(
        `http://localhost:5000/api/employees/${employeeId}/attendance/mark`,
        { date, status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchEmployees();
    } finally {
      setSavingId("");
    }
  };

  return (
    <MainLayout>
      <style>{styles}</style>
      <div className="ca-root">
        <div className="ca-head">
          <div>
            <div className="ca-title">Attendance Marking</div>
            <div className="ca-sub">Cashier can mark daily attendance for employees</div>
          </div>
          <div className="ca-controls">
            <input className="ca-input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            <button className="ca-btn" onClick={fetchEmployees}>Refresh</button>
          </div>
        </div>

        <div className="ca-summary">
          <div className="ca-stat"><div className="ca-stat-k">Employees</div><div className="ca-stat-v">{counts.total}</div></div>
          <div className="ca-stat"><div className="ca-stat-k">Present</div><div className="ca-stat-v" style={{ color: "var(--ca-present)" }}>{counts.present}</div></div>
          <div className="ca-stat"><div className="ca-stat-k">Half</div><div className="ca-stat-v" style={{ color: "var(--ca-half)" }}>{counts.half}</div></div>
          <div className="ca-stat"><div className="ca-stat-k">Absent</div><div className="ca-stat-v" style={{ color: "var(--ca-absent)" }}>{counts.absent}</div></div>
        </div>

        <div className="ca-list">
          {loading ? (
            <div className="ca-row"><div>Loading employees...</div></div>
          ) : employees.length === 0 ? (
            <div className="ca-row"><div>No employees found</div></div>
          ) : employees.map((emp) => (
            <div key={emp._id} className="ca-row">
              <div>
                <div className="ca-name">{emp.name}</div>
                <div className="ca-role">{emp.role}</div>
              </div>
              <div className="ca-status">{getStatus(emp)}</div>
              <div className="ca-actions">
                <button className="ca-mark present" disabled={savingId === emp._id} onClick={() => mark(emp._id, "Present")}>Present</button>
                <button className="ca-mark half" disabled={savingId === emp._id} onClick={() => mark(emp._id, "Half")}>Half</button>
                <button className="ca-mark absent" disabled={savingId === emp._id} onClick={() => mark(emp._id, "Absent")}>Absent</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
