import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import MainLayout from "../layout/MainLayout";
import { generateDetailedReportPdf } from "../utils/reportPdf";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend,
} from "recharts";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,400&family=Clash+Display:wght@400;500;600;700&family=Cabinet+Grotesk:wght@400;500;700;800&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

  :root {
    --bg:         #080c14;
    --bg2:        #0d1221;
    --bg3:        #111827;
    --bg4:        #162035;
    --card:       #0f1729;
    --card2:      #141e32;
    --border:     rgba(99,132,255,0.12);
    --border2:    rgba(99,132,255,0.22);
    --teal:       #00e5c8;
    --teal-dim:   rgba(0,229,200,0.10);
    --teal-glow:  rgba(0,229,200,0.25);
    --amber:      #ffb547;
    --amber-dim:  rgba(255,181,71,0.10);
    --amber-glow: rgba(255,181,71,0.25);
    --blue:       #4f9eff;
    --blue-dim:   rgba(79,158,255,0.10);
    --rose:       #ff6b8a;
    --rose-dim:   rgba(255,107,138,0.10);
    --violet:     #a78bfa;
    --violet-dim: rgba(167,139,250,0.10);
    --green:      #34d399;
    --green-dim:  rgba(52,211,153,0.10);
    --txt:        #e2e8f8;
    --txt2:       #7c8db5;
    --txt3:       #3d4f72;
    --mono:       'JetBrains Mono', monospace;
    --display:    'Outfit', sans-serif;
    --r:          16px;
    --r-sm:       10px;
  }

  .rpt * { box-sizing: border-box; margin: 0; padding: 0; }
  .rpt {
    font-family: var(--display);
    background: var(--bg);
    color: var(--txt);
    min-height: 100vh;
    padding: 28px 32px 48px;
    background-image:
      radial-gradient(ellipse 60% 40% at 70% 0%, rgba(0,229,200,0.04) 0%, transparent 60%),
      radial-gradient(ellipse 50% 30% at 10% 80%, rgba(255,181,71,0.03) 0%, transparent 60%);
  }

  /* ── Header ── */
  .rpt-header {
    display: flex; align-items: flex-start; justify-content: space-between;
    margin-bottom: 32px; gap: 16px; flex-wrap: wrap;
  }
  .rpt-title-block {}
  .rpt-eyebrow {
    font-family: var(--mono); font-size: 10px; font-weight: 500;
    color: var(--teal); letter-spacing: 2.5px; text-transform: uppercase;
    margin-bottom: 6px; display: flex; align-items: center; gap: 6px;
  }
  .rpt-eyebrow::before {
    content: ''; display: inline-block; width: 18px; height: 1px; background: var(--teal);
  }
  .rpt-h1 {
    font-size: 32px; font-weight: 800; letter-spacing: -0.8px;
    background: linear-gradient(135deg, #e2e8f8 0%, #7c8db5 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .rpt-sub { font-size: 13px; color: var(--txt2); margin-top: 4px; }

  /* Controls */
  .rpt-controls { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
  .rpt-date-input {
    background: var(--card); border: 1px solid var(--border); color: var(--txt2);
    font-family: var(--mono); font-size: 11px; padding: 8px 10px; border-radius: var(--r-sm);
  }
  .rpt-range-tabs {
    display: flex; background: var(--card); border: 1px solid var(--border);
    border-radius: var(--r-sm); padding: 3px; gap: 2px;
  }
  .rpt-tab {
    padding: 6px 14px; border-radius: 7px; border: none; background: transparent;
    color: var(--txt2); font-family: var(--display); font-size: 12px; font-weight: 600;
    cursor: pointer; transition: all .18s; white-space: nowrap;
  }
  .rpt-tab.active {
    background: var(--teal); color: #080c14; box-shadow: 0 2px 12px var(--teal-glow);
  }
  .rpt-refresh-btn {
    display: flex; align-items: center; gap: 6px;
    background: var(--card); border: 1px solid var(--border);
    color: var(--txt2); font-family: var(--display); font-size: 12px; font-weight: 600;
    padding: 8px 14px; border-radius: var(--r-sm); cursor: pointer; transition: all .18s;
  }
  .rpt-refresh-btn:hover { border-color: var(--border2); color: var(--teal); }
  .rpt-refresh-btn.spinning svg { animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── KPI Cards ── */
  .rpt-kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 24px; }
  @media (max-width: 1100px) { .rpt-kpis { grid-template-columns: repeat(2, 1fr); } }

  .rpt-kpi {
    background: var(--card); border: 1px solid var(--border);
    border-radius: var(--r); padding: 20px 22px; position: relative; overflow: hidden;
    transition: border-color .2s, transform .2s;
    animation: kpi-in .5s ease both;
  }
  .rpt-kpi:hover { border-color: var(--border2); transform: translateY(-2px); }
  @keyframes kpi-in { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
  .rpt-kpi:nth-child(1) { animation-delay: .05s; }
  .rpt-kpi:nth-child(2) { animation-delay: .10s; }
  .rpt-kpi:nth-child(3) { animation-delay: .15s; }
  .rpt-kpi:nth-child(4) { animation-delay: .20s; }

  .rpt-kpi::after {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
    border-radius: var(--r) var(--r) 0 0;
  }
  .rpt-kpi.c-teal::after   { background: linear-gradient(90deg, var(--teal), transparent); }
  .rpt-kpi.c-amber::after  { background: linear-gradient(90deg, var(--amber), transparent); }
  .rpt-kpi.c-blue::after   { background: linear-gradient(90deg, var(--blue), transparent); }
  .rpt-kpi.c-violet::after { background: linear-gradient(90deg, var(--violet), transparent); }

  .rpt-kpi-label {
    font-family: var(--mono); font-size: 10px; font-weight: 500; text-transform: uppercase;
    letter-spacing: 1.5px; color: var(--txt2); margin-bottom: 10px;
    display: flex; align-items: center; gap: 6px;
  }
  .rpt-kpi-icon { font-size: 14px; }
  .rpt-kpi-val {
    font-family: var(--mono); font-size: 28px; font-weight: 700; letter-spacing: -1px;
    line-height: 1;
  }
  .rpt-kpi.c-teal   .rpt-kpi-val { color: var(--teal); }
  .rpt-kpi.c-amber  .rpt-kpi-val { color: var(--amber); }
  .rpt-kpi.c-blue   .rpt-kpi-val { color: var(--blue); }
  .rpt-kpi.c-violet .rpt-kpi-val { color: var(--violet); }

  .rpt-kpi-sub { font-size: 11px; color: var(--txt3); margin-top: 6px; }
  .rpt-kpi-bg-icon {
    position: absolute; right: 14px; bottom: 10px; font-size: 48px; opacity: 0.05;
    pointer-events: none; user-select: none;
  }

  /* ── Charts Row ── */
  .rpt-charts-row { display: grid; grid-template-columns: 2fr 1fr; gap: 14px; margin-bottom: 24px; }
  @media (max-width: 1100px) { .rpt-charts-row { grid-template-columns: 1fr; } }

  /* ── Bottom Row ── */
  .rpt-bottom-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; }
  @media (max-width: 1100px) { .rpt-bottom-row { grid-template-columns: 1fr; } }

  /* ── Panel ── */
  .rpt-panel {
    background: var(--card); border: 1px solid var(--border);
    border-radius: var(--r); padding: 22px 24px;
    animation: kpi-in .5s ease both;
  }
  .rpt-panel-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 18px;
  }
  .rpt-panel-title {
    font-size: 13px; font-weight: 700; color: var(--txt);
    display: flex; align-items: center; gap: 7px;
  }
  .rpt-panel-title-dot {
    width: 6px; height: 6px; border-radius: 50%;
  }
  .rpt-panel-badge {
    font-family: var(--mono); font-size: 10px; font-weight: 600;
    padding: 3px 9px; border-radius: 20px; background: var(--teal-dim); color: var(--teal);
  }

  /* Chart tooltip */
  .rpt-tooltip {
    background: var(--bg2); border: 1px solid var(--border2);
    border-radius: 10px; padding: 10px 14px;
    font-family: var(--mono); font-size: 11px;
  }
  .rpt-tooltip-label { color: var(--txt2); margin-bottom: 4px; font-size: 10px; }
  .rpt-tooltip-val { font-size: 14px; font-weight: 700; }

  /* Top Items */
  .rpt-item-row {
    display: flex; align-items: center; gap: 10px;
    padding: 8px 0; border-bottom: 1px solid var(--border);
  }
  .rpt-item-row:last-child { border-bottom: none; }
  .rpt-item-rank {
    font-family: var(--mono); font-size: 10px; font-weight: 700; color: var(--txt3);
    width: 18px; text-align: center; flex-shrink: 0;
  }
  .rpt-item-rank.top { color: var(--amber); }
  .rpt-item-name { flex: 1; font-size: 12px; font-weight: 600; color: var(--txt); }
  .rpt-item-bar-wrap { width: 80px; height: 4px; background: var(--bg4); border-radius: 4px; overflow: hidden; }
  .rpt-item-bar { height: 100%; border-radius: 4px; background: linear-gradient(90deg, var(--teal), var(--blue)); }
  .rpt-item-val { font-family: var(--mono); font-size: 11px; color: var(--teal); font-weight: 600; min-width: 36px; text-align: right; }

  /* Payment method rows */
  .rpt-pay-row {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 0; border-bottom: 1px solid var(--border);
  }
  .rpt-pay-row:last-child { border-bottom: none; }
  .rpt-pay-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .rpt-pay-name { flex: 1; font-size: 12px; font-weight: 600; color: var(--txt); }
  .rpt-pay-count { font-family: var(--mono); font-size: 10px; color: var(--txt2); }
  .rpt-pay-amount { font-family: var(--mono); font-size: 12px; font-weight: 700; color: var(--txt); }

  /* Hourly heatmap */
  .rpt-heatmap { display: grid; grid-template-columns: repeat(12, 1fr); gap: 4px; }
  .rpt-heat-cell {
    aspect-ratio: 1; border-radius: 4px; display: flex; align-items: center;
    justify-content: center; font-family: var(--mono); font-size: 9px;
    color: var(--txt3); cursor: default; transition: transform .15s;
  }
  .rpt-heat-cell:hover { transform: scale(1.2); }
  .rpt-heat-label { font-family: var(--mono); font-size: 9px; color: var(--txt3); margin-bottom: 8px; }

  /* Orders table */
  .rpt-orders-table { width: 100%; border-collapse: collapse; }
  .rpt-orders-table th {
    font-family: var(--mono); font-size: 9px; text-transform: uppercase; letter-spacing: 1px;
    color: var(--txt3); padding: 0 8px 10px; text-align: left; font-weight: 600;
  }
  .rpt-orders-table td {
    font-size: 12px; padding: 8px 8px; border-top: 1px solid var(--border);
  }
  .rpt-orders-table tr:hover td { background: rgba(99,132,255,0.03); }
  .rpt-inv { font-family: var(--mono); font-size: 11px; color: var(--blue); }
  .rpt-amt { font-family: var(--mono); font-size: 12px; font-weight: 700; color: var(--teal); }
  .rpt-pay-tag {
    font-size: 9px; font-weight: 700; padding: 2px 8px; border-radius: 20px;
    font-family: var(--mono);
  }
  .tag-cash   { background: var(--green-dim); color: var(--green); }
  .tag-card   { background: var(--blue-dim);  color: var(--blue);  }
  .tag-travel { background: rgba(0,229,200,.10); color: var(--teal); }
  .tag-bank   { background: var(--violet-dim); color: var(--violet); }
  .tag-unpaid { background: var(--rose-dim);  color: var(--rose);  }
  .tag-other  { background: var(--amber-dim); color: var(--amber); }

  /* Empty / loading */
  .rpt-loading {
    display: flex; align-items: center; justify-content: center;
    height: 160px; color: var(--txt3); font-size: 12px; gap: 8px;
  }
  .rpt-dot-pulse { display: flex; gap: 4px; }
  .rpt-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--teal); animation: dp 1.2s ease-in-out infinite; }
  .rpt-dot:nth-child(2) { animation-delay: .2s; }
  .rpt-dot:nth-child(3) { animation-delay: .4s; }
  @keyframes dp { 0%,80%,100% { opacity:.2; transform:scale(.8); } 40% { opacity:1; transform:scale(1.2); } }

  /* Scrollbar */
  .rpt *::-webkit-scrollbar { width: 3px; }
  .rpt *::-webkit-scrollbar-thumb { background: var(--txt3); border-radius: 4px; }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const API = "http://localhost:5000/api";
const fmt = (n) => Number(n || 0).toLocaleString();

const PAY_COLORS = {
  "Cash": "#34d399", "Card": "#4f9eff", "Travel Package": "#00e5c8",
  "Bank Transfer": "#a78bfa", "Unpaid": "#ff6b8a", "Other": "#ffb547",
};
const payTagClass = (m) => {
  const map = { Cash:"cash", Card:"card", "Travel Package":"travel", "Bank Transfer":"bank", Unpaid:"unpaid" };
  return `tag-${map[m]||"other"}`;
};

function useAnimatedCount(target, duration = 1200) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!target) return;
    const start = Date.now();
    const from = 0;
    const to = Number(target);
    const tick = () => {
      const p = Math.min(1, (Date.now() - start) / duration);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(from + (to - from) * ease));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target]);
  return val;
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
function ChartTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rpt-tooltip">
      <div className="rpt-tooltip-label">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="rpt-tooltip-val" style={{ color: p.color }}>
          Rs. {fmt(p.value)}
        </div>
      ))}
    </div>
  );
}

// ─── KPI Card ────────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, icon, color, prefix = "Rs. ", delay = 0 }) {
  const animated = useAnimatedCount(value);
  return (
    <div className={`rpt-kpi c-${color}`} style={{ animationDelay: `${delay}s` }}>
      <div className="rpt-kpi-label"><span className="rpt-kpi-icon">{icon}</span>{label}</div>
      <div className="rpt-kpi-val">{prefix}{fmt(animated)}</div>
      {sub && <div className="rpt-kpi-sub">{sub}</div>}
      <div className="rpt-kpi-bg-icon">{icon}</div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Reports() {
  const [daily, setDaily] = useState(null);
  const [monthly, setMonthly] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [range, setRange] = useState("7d"); // 7d | 30d | 90d
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const fetchAll = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const [dailyRes, monthlyRes, chartRes, ordersRes] = await Promise.allSettled([
        axios.get(`${API}/reports/daily`,   { headers }),
        axios.get(`${API}/reports/monthly`, { headers }),
        axios.get(`${API}/reports/chart`,   { headers }),
        axios.get(`${API}/orders`,           { headers }),
      ]);

      if (dailyRes.status   === "fulfilled") setDaily(dailyRes.value.data);
      if (monthlyRes.status === "fulfilled") setMonthly(monthlyRes.value.data);

      if (chartRes.status === "fulfilled") {
        const raw = chartRes.value.data || [];
        const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        const from = fromDate ? new Date(fromDate) : null;
        const to = toDate ? new Date(toDate) : null;
        const filtered = raw
          .filter(item => {
            const d = new Date(item._id.year || new Date().getFullYear(), (item._id.month||1)-1, item._id.day||1);
            if (from && d < from) return false;
            if (to && d > to) return false;
            if (!from && d < cutoff) return false;
            return true;
          })
          .map(item => ({
            date: `${item._id.day}/${item._id.month}`,
            sales: item.totalSales || 0,
            orders: item.orderCount || 0,
          }));
        setChartData(filtered);
      }

      if (ordersRes.status === "fulfilled") {
        setOrders(ordersRes.value.data || []);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false); setRefreshing(false);
  }, [range, fromDate, toDate]);

  useEffect(() => { fetchAll(); }, [range]);

  // ── Derived stats ────────────────────────────────────────────────────────
  const periodOrders = orders.filter((o) => {
    const d = new Date(o.createdAt);
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;
    if (from && d < from) return false;
    if (to && d > to) return false;
    if (!from) {
      const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      if (d < cutoff) return false;
    }
    return true;
  });

  const todayOrders = periodOrders.filter(o => {
    const d = new Date(o.createdAt);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  });

  const totalOrders = periodOrders.length;

  // Payment method breakdown
  const payBreakdown = periodOrders.reduce((acc, o) => {
    const m = o.paymentMethod || "Other";
    if (!acc[m]) acc[m] = { count: 0, total: 0 };
    acc[m].count++;
    acc[m].total += Number(o.grandTotal || 0);
    return acc;
  }, {});
  const payData = Object.entries(payBreakdown)
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.total - a.total);

  // Pie data
  const pieData = payData.map(p => ({ name: p.name, value: p.total }));

  // Top items
  const itemCounts = periodOrders.reduce((acc, o) => {
    (o.items || []).forEach(i => {
      const key = i.name || "Unknown";
      if (!acc[key]) acc[key] = 0;
      acc[key] += i.quantity || 1;
    });
    return acc;
  }, {});
  const topItems = Object.entries(itemCounts)
    .map(([name, qty]) => ({ name, qty }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 8);
  const maxQty = topItems[0]?.qty || 1;

  // Hourly heatmap (0-23)
  const hourlyMap = Array(24).fill(0);
  periodOrders.forEach(o => {
    const h = new Date(o.createdAt).getHours();
    hourlyMap[h]++;
  });
  const maxHour = Math.max(...hourlyMap, 1);

  // Recent orders (last 10)
  const recentOrders = [...periodOrders]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 10);

  // Avg order value
  const avgOrder = totalOrders > 0
    ? Math.round(periodOrders.reduce((s, o) => s + Number(o.grandTotal || 0), 0) / totalOrders)
    : 0;

  const exportPdf = () => {
    generateDetailedReportPdf({
      title: "Sales Analytics Detailed Report",
      subtitle: "Comprehensive report for selected period",
      filters: [
        { label: "Preset Range", value: range },
        { label: "From", value: fromDate || "Auto by preset" },
        { label: "To", value: toDate || "Now" },
      ],
      summary: [
        { label: "Orders", value: totalOrders },
        { label: "Total Sales", value: `Rs. ${fmt(periodOrders.reduce((s, o) => s + Number(o.grandTotal || 0), 0))}` },
        { label: "Average Order", value: `Rs. ${fmt(avgOrder)}` },
        { label: "Unpaid Orders", value: periodOrders.filter((o) => o.paymentMethod === "Unpaid").length },
      ],
      columns: ["Invoice", "Date/Time", "Customer", "Items Detail", "Payment", "Total (Rs.)"],
      rows: periodOrders
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map((o) => [
          o.invoiceNumber || "-",
          new Date(o.createdAt).toLocaleString(),
          o.customerPhone || "Walk-in",
          (o.items || [])
            .map((i) => `${i.name}${i.portion ? ` (${i.portion})` : ""} x${i.quantity}`)
            .join(", "),
          o.paymentMethod || "Cash",
          fmt(o.grandTotal || 0),
        ]),
    });
  };

  if (loading) return (
    <MainLayout>
      <style>{CSS}</style>
      <div className="rpt">
        <div className="rpt-loading">
          <div className="rpt-dot-pulse">
            <div className="rpt-dot" /><div className="rpt-dot" /><div className="rpt-dot" />
          </div>
          Loading analytics...
        </div>
      </div>
    </MainLayout>
  );

  return (
    <MainLayout>
      <style>{CSS}</style>
      <div className="rpt">

        {/* ── Header ── */}
        <div className="rpt-header">
          <div className="rpt-title-block">
            <div className="rpt-eyebrow">Analytics Dashboard</div>
            <div className="rpt-h1">Sales Reports</div>
            <div className="rpt-sub">
              Last updated: {new Date().toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
            </div>
          </div>
          <div className="rpt-controls">
            <div className="rpt-range-tabs">
              {["7d","30d","90d"].map(r => (
                <button key={r} className={`rpt-tab ${range===r?"active":""}`} onClick={()=>setRange(r)}>
                  {r === "7d" ? "7 Days" : r === "30d" ? "30 Days" : "90 Days"}
                </button>
              ))}
            </div>
            <input
              className="rpt-date-input"
              type="datetime-local"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
            <input
              className="rpt-date-input"
              type="datetime-local"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
            <button className="rpt-refresh-btn" onClick={exportPdf}>Generate PDF</button>
            <button
              className="rpt-refresh-btn"
              onClick={() => {
                setFromDate("");
                setToDate("");
                setRange("7d");
              }}
            >
              Clear Period
            </button>
            <button className={`rpt-refresh-btn${refreshing?" spinning":""}`} onClick={()=>fetchAll(true)}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M23 4v6h-6"/><path d="M1 20v-6h6"/>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* ── KPI Cards ── */}
        <div className="rpt-kpis">
          <KpiCard label="Today's Revenue" value={daily?.totalSales || 0}
            sub={`${todayOrders.length} orders today`} icon="💰" color="teal" delay={.05} />
          <KpiCard label="Monthly Revenue" value={monthly?.totalSales || 0}
            sub={`${monthly?.orderCount || 0} orders this month`} icon="📅" color="amber" delay={.10} />
          <KpiCard label="Total Orders" value={totalOrders}
            sub="All time" icon="🧾" color="blue" delay={.15} prefix="" />
          <KpiCard label="Avg Order Value" value={avgOrder}
            sub="Per transaction" icon="📈" color="violet" delay={.20} />
        </div>

        {/* ── Charts Row ── */}
        <div className="rpt-charts-row">

          {/* Area chart */}
          <div className="rpt-panel" style={{animationDelay:".25s"}}>
            <div className="rpt-panel-header">
              <div className="rpt-panel-title">
                <span className="rpt-panel-title-dot" style={{background:"var(--teal)"}} />
                Revenue Trend
              </div>
              <span className="rpt-panel-badge">{range}</span>
            </div>
            {chartData.length === 0 ? (
              <div className="rpt-loading" style={{height:200}}>No chart data for this range</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={chartData} margin={{top:4,right:8,left:-20,bottom:0}}>
                  <defs>
                    <linearGradient id="tealGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00e5c8" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#00e5c8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,132,255,0.08)" />
                  <XAxis dataKey="date" tick={{fontSize:9,fill:"#3d4f72",fontFamily:"JetBrains Mono"}} axisLine={false} tickLine={false} />
                  <YAxis tick={{fontSize:9,fill:"#3d4f72",fontFamily:"JetBrains Mono"}} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTip />} />
                  <Area type="monotone" dataKey="sales" stroke="#00e5c8" strokeWidth={2}
                    fill="url(#tealGrad)" dot={false} activeDot={{r:4,fill:"#00e5c8",stroke:"#080c14",strokeWidth:2}} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Pie chart — payment methods */}
          <div className="rpt-panel" style={{animationDelay:".30s"}}>
            <div className="rpt-panel-header">
              <div className="rpt-panel-title">
                <span className="rpt-panel-title-dot" style={{background:"var(--amber)"}} />
                Payment Mix
              </div>
            </div>
            {pieData.length === 0 ? (
              <div className="rpt-loading" style={{height:200}}>No data</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={72}
                      dataKey="value" paddingAngle={3} strokeWidth={0}>
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={PAY_COLORS[entry.name] || "#ffb547"} opacity={0.9} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => `Rs. ${fmt(v)}`}
                      contentStyle={{background:"#0d1221",border:"1px solid rgba(99,132,255,0.2)",borderRadius:8,fontSize:11,fontFamily:"JetBrains Mono"}}
                      itemStyle={{color:"#e2e8f8"}} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{display:"flex",flexDirection:"column",gap:0}}>
                  {payData.map((p, i) => (
                    <div key={i} className="rpt-pay-row">
                      <span className="rpt-pay-dot" style={{background:PAY_COLORS[p.name]||"#ffb547"}} />
                      <span className="rpt-pay-name">{p.name}</span>
                      <span className="rpt-pay-count">{p.count}×</span>
                      <span className="rpt-pay-amount">Rs. {fmt(p.total)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Bottom Row ── */}
        <div className="rpt-bottom-row">

          {/* Top Items */}
          <div className="rpt-panel" style={{animationDelay:".35s"}}>
            <div className="rpt-panel-header">
              <div className="rpt-panel-title">
                <span className="rpt-panel-title-dot" style={{background:"var(--blue)"}} />
                Top Items
              </div>
              <span className="rpt-panel-badge">{topItems.length} items</span>
            </div>
            {topItems.length === 0 ? (
              <div className="rpt-loading" style={{height:120}}>No item data</div>
            ) : topItems.map((item, i) => (
              <div key={i} className="rpt-item-row">
                <span className={`rpt-item-rank ${i<3?"top":""}`}>
                  {i===0?"🥇":i===1?"🥈":i===2?"🥉":`${i+1}`}
                </span>
                <span className="rpt-item-name">{item.name}</span>
                <div className="rpt-item-bar-wrap">
                  <div className="rpt-item-bar" style={{width:`${Math.round((item.qty/maxQty)*100)}%`}} />
                </div>
                <span className="rpt-item-val">×{item.qty}</span>
              </div>
            ))}
          </div>

          {/* Hourly Activity Heatmap */}
          <div className="rpt-panel" style={{animationDelay:".40s"}}>
            <div className="rpt-panel-header">
              <div className="rpt-panel-title">
                <span className="rpt-panel-title-dot" style={{background:"var(--violet)"}} />
                Hourly Activity
              </div>
            </div>
            <div className="rpt-heat-label">Orders by hour of day (0–23)</div>
            <div className="rpt-heatmap">
              {hourlyMap.map((count, h) => {
                const intensity = count / maxHour;
                const bg = count === 0
                  ? "rgba(255,255,255,0.03)"
                  : `rgba(0,229,200,${0.1 + intensity * 0.8})`;
                return (
                  <div key={h} className="rpt-heat-cell"
                    style={{background: bg}}
                    title={`${h}:00 — ${count} orders`}
                  >
                    {h}
                  </div>
                );
              })}
            </div>
            <div style={{marginTop:16}}>
              <ResponsiveContainer width="100%" height={100}>
                <BarChart data={hourlyMap.map((v,h)=>({h:`${h}`,v}))} margin={{top:4,right:0,left:-30,bottom:0}}>
                  <Bar dataKey="v" radius={[3,3,0,0]}>
                    {hourlyMap.map((v,i) => (
                      <Cell key={i} fill={v===Math.max(...hourlyMap)?"#00e5c8":"rgba(0,229,200,0.25)"} />
                    ))}
                  </Bar>
                  <XAxis dataKey="h" tick={{fontSize:8,fill:"#3d4f72"}} axisLine={false} tickLine={false} interval={2} />
                  <Tooltip formatter={(v)=>`${v} orders`}
                    contentStyle={{background:"#0d1221",border:"1px solid rgba(99,132,255,0.2)",borderRadius:8,fontSize:11,fontFamily:"JetBrains Mono"}}
                    itemStyle={{color:"#e2e8f8"}} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="rpt-panel" style={{animationDelay:".45s",overflowX:"auto"}}>
            <div className="rpt-panel-header">
              <div className="rpt-panel-title">
                <span className="rpt-panel-title-dot" style={{background:"var(--rose)"}} />
                Recent Orders
              </div>
              <span className="rpt-panel-badge">Last 10</span>
            </div>
            {recentOrders.length === 0 ? (
              <div className="rpt-loading" style={{height:120}}>No orders</div>
            ) : (
              <table className="rpt-orders-table">
                <thead>
                  <tr>
                    <th>Invoice</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((o, i) => (
                    <tr key={i}>
                      <td><span className="rpt-inv">#{o.invoiceNumber||"—"}</span></td>
                      <td><span className="rpt-amt">Rs. {fmt(o.grandTotal)}</span></td>
                      <td>
                        <span className={`rpt-pay-tag ${payTagClass(o.paymentMethod)}`}>
                          {o.paymentMethod||"Cash"}
                        </span>
                      </td>
                      <td style={{fontSize:10,color:"var(--txt2)",fontFamily:"var(--mono)"}}>
                        {new Date(o.createdAt).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

        </div>
      </div>
    </MainLayout>
  );
}
