import React, { useEffect, useState } from "react";
import axios from "axios";
import MainLayout from "../layout/MainLayout";
import { generateDetailedReportPdf } from "../utils/reportPdf";

export default function AuditLogs() {
  const token = localStorage.getItem("token");
  const [logs, setLogs] = useState([]);
  const [filters, setFilters] = useState({ users: [], tasks: [], modules: [] });
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState({
    date: "",
    startDate: "",
    endDate: "",
    userName: "",
    task: "",
    module: "",
    status: "",
  });

  const fetchFilterOptions = async () => {
    const res = await axios.get("http://localhost:5000/api/logs/filters", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setFilters({
      users: res.data.users || [],
      tasks: res.data.tasks || [],
      modules: res.data.modules || [],
    });
  };

  const fetchLogs = async (nextQuery = query) => {
    setLoading(true);
    try {
      const params = {};
      if (nextQuery.date) params.date = nextQuery.date;
      if (nextQuery.startDate) params.startDate = nextQuery.startDate;
      if (nextQuery.endDate) params.endDate = nextQuery.endDate;
      if (nextQuery.userName) params.userName = nextQuery.userName;
      if (nextQuery.task) params.task = nextQuery.task;
      if (nextQuery.module) params.module = nextQuery.module;
      if (nextQuery.status) params.status = nextQuery.status;

      const res = await axios.get("http://localhost:5000/api/logs", {
        headers: { Authorization: `Bearer ${token}` },
        params: { ...params, limit: 500 },
      });
      setLogs(res.data.logs || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilterOptions();
    fetchLogs();
  }, []);

  const exportPdf = () => {
    generateDetailedReportPdf({
      title: "Audit Logs Detailed Report",
      subtitle: "Security and activity tracking report",
      filters: [
        { label: "Date", value: query.date || "Any" },
        { label: "Start", value: query.startDate || "Any" },
        { label: "End", value: query.endDate || "Any" },
        { label: "User", value: query.userName || "Any" },
        { label: "Task", value: query.task || "Any" },
        { label: "Module", value: query.module || "Any" },
        { label: "Status", value: query.status || "Any" },
      ],
      summary: [
        { label: "Total Logs", value: logs.length },
        { label: "Success", value: logs.filter((l) => l.status !== "FAILED").length },
        { label: "Failed", value: logs.filter((l) => l.status === "FAILED").length },
      ],
      columns: ["When", "User", "Role", "Task", "Module", "Status", "Description", "IP"],
      rows: logs.map((l) => [
        new Date(l.createdAt).toLocaleString(),
        l.userName || "Unknown",
        l.role || "-",
        l.task || l.action || "-",
        l.module || "-",
        l.status || "SUCCESS",
        l.description || "-",
        l.ipAddress || "-",
      ]),
    });
  };

  return (
    <MainLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Audit Logs</h1>
          <div className="flex gap-2">
            <button
              onClick={exportPdf}
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded"
            >
              Generate PDF
            </button>
            <button
              onClick={fetchLogs}
              className="px-4 py-2 bg-amber-500 text-black font-semibold rounded"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-7 gap-3 bg-slate-900/60 border border-white/10 rounded-xl p-4">
          <input
            type="date"
            value={query.date}
            onChange={(e) => setQuery((p) => ({ ...p, date: e.target.value }))}
            className="p-2 rounded bg-slate-800 text-white border border-white/10"
          />
          <input
            type="datetime-local"
            value={query.startDate}
            onChange={(e) => setQuery((p) => ({ ...p, startDate: e.target.value, date: "" }))}
            className="p-2 rounded bg-slate-800 text-white border border-white/10"
          />
          <input
            type="datetime-local"
            value={query.endDate}
            onChange={(e) => setQuery((p) => ({ ...p, endDate: e.target.value, date: "" }))}
            className="p-2 rounded bg-slate-800 text-white border border-white/10"
          />

          <select
            value={query.userName}
            onChange={(e) => setQuery((p) => ({ ...p, userName: e.target.value }))}
            className="p-2 rounded bg-slate-800 text-white border border-white/10"
          >
            <option value="">All Users</option>
            {filters.users.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>

          <select
            value={query.task}
            onChange={(e) => setQuery((p) => ({ ...p, task: e.target.value }))}
            className="p-2 rounded bg-slate-800 text-white border border-white/10"
          >
            <option value="">All Tasks</option>
            {filters.tasks.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <select
            value={query.module}
            onChange={(e) => setQuery((p) => ({ ...p, module: e.target.value }))}
            className="p-2 rounded bg-slate-800 text-white border border-white/10"
          >
            <option value="">All Modules</option>
            {filters.modules.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          <div className="flex gap-2 md:col-span-2">
            <select
              value={query.status}
              onChange={(e) => setQuery((p) => ({ ...p, status: e.target.value }))}
              className="flex-1 p-2 rounded bg-slate-800 text-white border border-white/10"
            >
              <option value="">All Status</option>
              <option value="SUCCESS">SUCCESS</option>
              <option value="FAILED">FAILED</option>
            </select>
            <button
              onClick={fetchLogs}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Filter
            </button>
            <button
              onClick={() => {
                const reset = {
                  date: "",
                  startDate: "",
                  endDate: "",
                  userName: "",
                  task: "",
                  module: "",
                  status: "",
                };
                setQuery(reset);
                fetchLogs(reset);
              }}
              className="px-4 py-2 bg-slate-700 text-white rounded"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-white/10 rounded-xl overflow-auto">
          <table className="w-full text-sm text-left text-slate-200">
            <thead className="bg-slate-800/90 text-slate-300">
              <tr>
                <th className="p-3">When</th>
                <th className="p-3">User</th>
                <th className="p-3">Role</th>
                <th className="p-3">Task</th>
                <th className="p-3">Module</th>
                <th className="p-3">Status</th>
                <th className="p-3">Description</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="p-4" colSpan="7">
                    Loading logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td className="p-4" colSpan="7">
                    No audit logs found
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="border-t border-white/10">
                    <td className="p-3 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="p-3">{log.userName || "Unknown"}</td>
                    <td className="p-3">{log.role || "-"}</td>
                    <td className="p-3">{log.task || log.action}</td>
                    <td className="p-3">{log.module || "-"}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          log.status === "FAILED"
                            ? "bg-red-900/40 text-red-300"
                            : "bg-green-900/40 text-green-300"
                        }`}
                      >
                        {log.status || "SUCCESS"}
                      </span>
                    </td>
                    <td className="p-3">{log.description || "-"}</td>
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
