import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const buildStyles = (minimized) => `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Crimson+Text:ital,wght@0,400;0,600;1,400;1,600&family=Share+Tech+Mono:wght@400&display=swap');

  :root {
    --navy:         #060e1c;
    --navy-mid:     #0a1628;
    --navy-card:    #0d1e38;
    --navy-hover:   #122040;
    --gold:         #c9943a;
    --gold-light:   #e8b84b;
    --gold-bright:  #f5d070;
    --gold-dim:     rgba(201,148,58,0.12);
    --gold-glow:    rgba(201,148,58,0.28);
    --sky:          #5bb8f5;
    --sky-dim:      rgba(91,184,245,0.1);
    --danger:       #ef4444;
    --danger-dim:   rgba(239,68,68,0.1);
    --text:         #f0f4f8;
    --muted:        rgba(176,200,230,0.5);
    --dim:          rgba(176,200,230,0.2);
    --border:       rgba(255,255,255,0.07);
    --border-gold:  rgba(201,148,58,0.18);
    --sidebar-w:    248px;
    --sidebar-mini: 68px;
    --transition:   0.28s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* ── ROOT ── */
  .sb-root {
    font-family: 'Crimson Text', serif;
    width: var(--sidebar-w);
    min-width: var(--sidebar-w);
    height: 100vh;
    background: var(--navy);
    border-right: 1px solid var(--border-gold);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
    transition: width var(--transition), min-width var(--transition);
    flex-shrink: 0;
  }
  .sb-root.minimized {
    width: var(--sidebar-mini);
    min-width: var(--sidebar-mini);
  }

  /* Gold right-edge shimmer */
  .sb-root::after {
    content: '';
    position: absolute; right: 0; top: 0; bottom: 0; width: 1px;
    background: linear-gradient(to bottom, transparent 0%, var(--gold) 40%, var(--gold-light) 60%, transparent 100%);
    opacity: 0.25; pointer-events: none; z-index: 10;
  }

  /* ── STARFIELD ── */
  .sb-stars {
    position: absolute; inset: 0; pointer-events: none; z-index: 0; overflow: hidden;
  }
  .sb-star {
    position: absolute; border-radius: 50%; background: white;
    animation: sb-twinkle ease-in-out infinite;
  }
  @keyframes sb-twinkle {
    0%,100% { opacity: var(--op); }
    50%      { opacity: calc(var(--op) * 0.12); }
  }

  /* ── TOGGLE BUTTON — perfectly centered on the border ── */
  .sb-toggle {
    position: absolute;
    top: 50%;
    right: -14px;
    transform: translateY(-50%);
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: var(--navy-card);
    border: 1px solid var(--border-gold);
    color: var(--gold-light);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    z-index: 20;
    transition: background var(--transition), border-color var(--transition), transform var(--transition);
    box-shadow: 0 2px 12px rgba(0,0,0,0.5), 0 0 8px var(--gold-glow);
    flex-shrink: 0;
  }
  .sb-toggle:hover {
    background: var(--gold-dim);
    border-color: var(--gold);
    box-shadow: 0 2px 16px rgba(0,0,0,0.6), 0 0 14px var(--gold-glow);
  }
  /* Arrow flips smoothly */
  .sb-toggle-arrow {
    display: inline-block;
    transition: transform var(--transition);
    line-height: 1;
  }
  .sb-root.minimized .sb-toggle-arrow {
    transform: rotate(180deg);
  }

  /* ── HEADER ── */
  .sb-header {
    position: relative; z-index: 1;
    padding: 22px 16px 18px;
    border-bottom: 1px solid var(--border-gold);
    background: linear-gradient(180deg, rgba(13,34,68,0.6) 0%, transparent 100%);
    flex-shrink: 0;
    overflow: hidden;
  }
  .sb-logo-row {
    display: flex;
    align-items: center;
    gap: 12px;
    /* In minimized: items are centered */
    transition: gap var(--transition);
  }
  .sb-root.minimized .sb-logo-row {
    gap: 0;
    justify-content: center;
  }
  .sb-logo-img {
    width: 38px; height: 38px;
    border-radius: 50%;
    object-fit: cover;
    border: 1.5px solid var(--gold);
    box-shadow: 0 0 14px var(--gold-glow), 0 4px 10px rgba(0,0,0,0.5);
    flex-shrink: 0;
    background: var(--navy-card);
    transition: width var(--transition), height var(--transition);
  }
  .sb-logo-fallback {
    width: 38px; height: 38px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--gold), var(--gold-light));
    display: flex; align-items: center; justify-content: center;
    font-size: 20px; flex-shrink: 0;
    border: 1.5px solid var(--gold);
    box-shadow: 0 0 14px var(--gold-glow);
    transition: width var(--transition), height var(--transition);
  }
  /* Text block fades + slides out */
  .sb-logo-text {
    line-height: 1.25;
    min-width: 0;
    overflow: hidden;
    transition: opacity var(--transition), max-width var(--transition), transform var(--transition);
    max-width: 160px;
    opacity: 1;
    transform: translateX(0);
  }
  .sb-root.minimized .sb-logo-text {
    max-width: 0;
    opacity: 0;
    transform: translateX(-8px);
    pointer-events: none;
  }
  .sb-logo-name {
    font-family: 'Cinzel', serif;
    font-size: 13px; font-weight: 700;
    color: var(--text); letter-spacing: 1.5px;
    white-space: nowrap;
  }
  .sb-logo-name span { color: var(--gold-light); }
  .sb-logo-sub {
    font-family: 'Share Tech Mono', monospace;
    font-size: 8.5px; color: var(--muted);
    letter-spacing: 2px; text-transform: uppercase;
    margin-top: 2px; white-space: nowrap;
  }

  /* ── USER CARD ── */
  .sb-user-card {
    position: relative; z-index: 1;
    margin: 12px 12px 0;
    background: var(--navy-card);
    border: 1px solid var(--border-gold);
    border-top-color: rgba(201,148,58,0.35);
    border-radius: 4px;
    padding: 12px 12px 10px;
    overflow: hidden;
    flex-shrink: 0;
    /* Collapses smoothly */
    transition: opacity var(--transition), max-height var(--transition), margin var(--transition), padding var(--transition), transform var(--transition);
    max-height: 120px;
    opacity: 1;
    transform: translateX(0);
  }
  .sb-root.minimized .sb-user-card {
    max-height: 0;
    opacity: 0;
    margin: 0 12px;
    padding: 0 12px;
    pointer-events: none;
    transform: translateX(-6px);
  }
  .sb-user-card::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, var(--gold-light), transparent);
    opacity: 0.5;
  }
  .sb-uc-tl, .sb-uc-tr, .sb-uc-bl, .sb-uc-br {
    position: absolute; width: 7px; height: 7px; opacity: 0.3;
  }
  .sb-uc-tl { top: 4px; left: 4px; border-top: 1px solid var(--gold); border-left: 1px solid var(--gold); }
  .sb-uc-tr { top: 4px; right: 4px; border-top: 1px solid var(--gold); border-right: 1px solid var(--gold); }
  .sb-uc-bl { bottom: 4px; left: 4px; border-bottom: 1px solid var(--gold); border-left: 1px solid var(--gold); }
  .sb-uc-br { bottom: 4px; right: 4px; border-bottom: 1px solid var(--gold); border-right: 1px solid var(--gold); }

  .sb-user-top {
    display: flex; align-items: center; gap: 9px; margin-bottom: 9px;
  }
  .sb-avatar {
    width: 34px; height: 34px; border-radius: 50%;
    background: linear-gradient(135deg, var(--navy-mid), var(--navy-hover));
    border: 1.5px solid var(--border-gold);
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; flex-shrink: 0;
    color: var(--gold-light);
    font-family: 'Cinzel', serif; font-weight: 700;
    box-shadow: 0 0 10px rgba(201,148,58,0.15);
  }
  .sb-user-info { min-width: 0; flex: 1; }
  .sb-user-name {
    font-family: 'Cinzel', serif;
    font-size: 11px; font-weight: 600;
    color: var(--text); letter-spacing: 0.5px;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .sb-user-email {
    font-family: 'Share Tech Mono', monospace;
    font-size: 8.5px; color: var(--dim);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    margin-top: 1px; letter-spacing: 0.3px;
  }
  .sb-online-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: #34d399; box-shadow: 0 0 8px #34d399;
    flex-shrink: 0;
    animation: online-pulse 2.5s infinite;
  }
  @keyframes online-pulse {
    0%,100% { opacity:1; box-shadow:0 0 6px #34d399; }
    50%      { opacity:0.4; box-shadow:0 0 12px #34d399; }
  }
  .sb-role-badge {
    display: flex; align-items: center; gap: 6px;
    background: var(--gold-dim);
    border: 1px solid var(--border-gold);
    border-radius: 3px;
    padding: 5px 9px; width: 100%;
  }
  .sb-role-anchor { font-size: 10px; }
  .sb-role-label {
    font-family: 'Share Tech Mono', monospace;
    font-size: 8px; color: var(--muted);
    letter-spacing: 2px; text-transform: uppercase;
  }
  .sb-role-value {
    margin-left: auto;
    font-family: 'Cinzel', serif;
    font-size: 9px; font-weight: 700;
    color: var(--gold-light); letter-spacing: 1px;
    text-transform: capitalize;
  }

  /* ── MINI USER (shown only when collapsed) ── */
  .sb-mini-user {
    position: relative; z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 14px 0 10px;
    flex-shrink: 0;
    /* Transitions */
    transition: opacity var(--transition), max-height var(--transition), padding var(--transition);
    max-height: 0;
    opacity: 0;
    overflow: hidden;
    pointer-events: none;
  }
  .sb-root.minimized .sb-mini-user {
    max-height: 80px;
    opacity: 1;
    pointer-events: auto;
  }
  .sb-mini-avatar {
    width: 36px; height: 36px; border-radius: 50%;
    background: linear-gradient(135deg, var(--navy-mid), var(--navy-hover));
    border: 1.5px solid var(--border-gold);
    display: flex; align-items: center; justify-content: center;
    font-size: 13px;
    color: var(--gold-light);
    font-family: 'Cinzel', serif; font-weight: 700;
    box-shadow: 0 0 10px rgba(201,148,58,0.15);
  }
  .sb-mini-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: #34d399; box-shadow: 0 0 6px #34d399;
    margin-top: 5px;
    animation: online-pulse 2.5s infinite;
  }

  /* ── SECTION LABEL ── */
  .sb-section-label {
    padding: 16px 16px 6px;
    font-family: 'Share Tech Mono', monospace;
    font-size: 8.5px; font-weight: 400;
    color: var(--dim); text-transform: uppercase;
    letter-spacing: 2.5px;
    position: relative; z-index: 1;
    flex-shrink: 0;
    white-space: nowrap;
    overflow: hidden;
    transition: opacity var(--transition), max-height var(--transition), padding var(--transition);
    max-height: 40px;
    opacity: 1;
  }
  .sb-root.minimized .sb-section-label {
    max-height: 0;
    opacity: 0;
    padding: 0;
    pointer-events: none;
  }

  /* ── NAV SCROLL AREA ── */
  .sb-nav {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 0 8px 4px;
    position: relative; z-index: 1;
  }
  .sb-nav::-webkit-scrollbar { width: 3px; }
  .sb-nav::-webkit-scrollbar-thumb { background: var(--border-gold); border-radius: 4px; }
  .sb-nav::-webkit-scrollbar-track { background: transparent; }

  /* ── NAV BUTTON ── */
  .sb-btn {
    width: 100%;
    display: flex; align-items: center; gap: 10px;
    padding: 9px 10px;
    border-radius: 4px;
    border: 1px solid transparent;
    background: transparent;
    color: var(--muted);
    font-family: 'Crimson Text', serif;
    font-size: 14px; font-weight: 400;
    cursor: pointer; text-align: left;
    transition: background .18s, color .18s, border-color .18s, padding var(--transition);
    margin-bottom: 2px;
    position: relative; overflow: hidden;
    letter-spacing: 0.3px;
    white-space: nowrap;
  }
  .sb-btn:hover {
    background: var(--navy-hover);
    color: var(--text);
    border-color: var(--border-gold);
  }
  .sb-btn.active {
    background: var(--gold-dim);
    color: var(--gold-light);
    border-color: rgba(201,148,58,0.25);
    border-left-color: var(--gold);
  }
  .sb-btn.active::before {
    content: '';
    position: absolute; left: 0; top: 0; bottom: 0; width: 2px;
    background: linear-gradient(180deg, var(--gold-bright), var(--gold));
  }
  /* When minimized, center the button content */
  .sb-root.minimized .sb-btn {
    padding: 9px;
    justify-content: center;
    border-radius: 8px;
  }
  .sb-btn-icon {
    font-size: 15px;
    width: 20px;
    text-align: center;
    flex-shrink: 0;
    opacity: 0.6;
    transition: opacity .18s;
  }
  .sb-btn.active .sb-btn-icon,
  .sb-btn:hover .sb-btn-icon { opacity: 1; }

  /* Label and pip fade out on collapse */
  .sb-btn-label {
    flex: 1;
    overflow: hidden;
    transition: opacity var(--transition), max-width var(--transition);
    max-width: 200px;
    opacity: 1;
  }
  .sb-root.minimized .sb-btn-label {
    max-width: 0;
    opacity: 0;
    pointer-events: none;
  }
  .sb-btn-pip {
    width: 4px; height: 4px; border-radius: 50%;
    background: var(--gold); opacity: 0;
    transition: opacity .18s, max-width var(--transition);
    flex-shrink: 0;
    max-width: 8px;
  }
  .sb-btn.active .sb-btn-pip { opacity: 1; }
  .sb-root.minimized .sb-btn-pip {
    max-width: 0;
    opacity: 0;
  }

  /* Tooltip on minimized hover */
  .sb-btn-tooltip {
    position: fixed;
    left: calc(var(--sidebar-mini) + 10px);
    background: var(--navy-card);
    border: 1px solid var(--border-gold);
    color: var(--gold-light);
    font-family: 'Cinzel', serif;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.5px;
    padding: 6px 12px;
    border-radius: 4px;
    white-space: nowrap;
    pointer-events: none;
    opacity: 0;
    transform: translateX(-6px);
    transition: opacity .15s, transform .15s;
    box-shadow: 0 4px 16px rgba(0,0,0,0.5), 0 0 8px var(--gold-glow);
    z-index: 1000;
  }
  .sb-btn:hover .sb-btn-tooltip {
    opacity: 1;
    transform: translateX(0);
  }
  /* Only show tooltip when minimized */
  .sb-root:not(.minimized) .sb-btn-tooltip {
    display: none;
  }

  /* ── DIVIDER ── */
  .sb-divider {
    display: flex; align-items: center; gap: 7px;
    margin: 6px 8px;
    transition: opacity var(--transition);
  }
  .sb-root.minimized .sb-divider {
    margin: 6px 2px;
  }
  .sb-divider-line {
    flex: 1; height: 1px; background: var(--border);
    transition: opacity var(--transition);
  }
  .sb-root.minimized .sb-divider-line { opacity: 0; flex: 0; }
  .sb-divider-icon { font-size: 9px; color: var(--dim); opacity: 0.6; }

  /* ── FOOTER ── */
  .sb-footer {
    position: relative; z-index: 1;
    padding: 10px 8px 14px;
    border-top: 1px solid var(--border-gold);
    background: linear-gradient(0deg, rgba(13,34,68,0.5) 0%, transparent 100%);
    flex-shrink: 0;
    overflow: hidden;
  }
  .sb-logout {
    width: 100%;
    display: flex; align-items: center; gap: 10px;
    padding: 9px 10px;
    border-radius: 4px;
    border: 1px solid transparent;
    background: transparent;
    color: var(--muted);
    font-family: 'Crimson Text', serif;
    font-size: 14px; font-weight: 400;
    cursor: pointer; text-align: left;
    transition: background .18s, color .18s, border-color .18s, padding var(--transition), justify-content var(--transition);
    white-space: nowrap;
  }
  .sb-logout:hover {
    background: var(--danger-dim);
    color: var(--danger);
    border-color: rgba(239,68,68,0.2);
  }
  .sb-root.minimized .sb-logout {
    justify-content: center;
    padding: 9px;
    border-radius: 8px;
  }
  .sb-logout-icon { font-size: 15px; width: 20px; text-align: center; flex-shrink: 0; }
  .sb-logout-label {
    transition: opacity var(--transition), max-width var(--transition);
    max-width: 160px;
    opacity: 1;
    overflow: hidden;
  }
  .sb-root.minimized .sb-logout-label {
    max-width: 0;
    opacity: 0;
    pointer-events: none;
  }

  /* Logout tooltip */
  .sb-logout-tooltip {
    position: fixed;
    left: calc(var(--sidebar-mini) + 10px);
    background: var(--navy-card);
    border: 1px solid rgba(239,68,68,0.3);
    color: var(--danger);
    font-family: 'Cinzel', serif;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.5px;
    padding: 6px 12px;
    border-radius: 4px;
    white-space: nowrap;
    pointer-events: none;
    opacity: 0;
    transform: translateX(-6px);
    transition: opacity .15s, transform .15s;
    box-shadow: 0 4px 16px rgba(0,0,0,0.5);
    z-index: 1000;
  }
  .sb-logout:hover .sb-logout-tooltip {
    opacity: 1;
    transform: translateX(0);
  }
  .sb-root:not(.minimized) .sb-logout-tooltip { display: none; }

  .sb-footer-brand {
    margin-top: 12px;
    text-align: center;
    padding-top: 8px;
    border-top: 1px solid rgba(255,255,255,0.04);
    transition: opacity var(--transition), max-height var(--transition), margin var(--transition);
    max-height: 50px;
    opacity: 1;
    overflow: hidden;
  }
  .sb-root.minimized .sb-footer-brand {
    max-height: 0;
    opacity: 0;
    margin: 0;
    pointer-events: none;
  }
  .sb-footer-company {
    font-family: 'Share Tech Mono', monospace;
    font-size: 8px; color: var(--dim);
    letter-spacing: 2px; text-transform: uppercase;
  }
  .sb-footer-support {
    font-family: 'Share Tech Mono', monospace;
    font-size: 7.5px; color: rgba(201,148,58,0.3);
    letter-spacing: 0.8px; margin-top: 2px;
  }
  .sb-footer-support span { color: rgba(201,148,58,0.5); }
`;

const STARS_DATA = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 100}%`,
  size: `${1 + Math.random() * 1.8}px`,
  dur: `${2 + Math.random() * 5}s`,
  delay: `${Math.random() * 5}s`,
  op: 0.15 + Math.random() * 0.45,
}));

const NAV = {
  admin: [
    { label: "Dashboard",     icon: "◈",  path: "/admin" },
    { label: "Reports",       icon: "📊", path: "/admin/reports" },
    { label: "Manage Items",  icon: "🍽️", path: "/admin/items" },
    { label: "Order History", icon: "📋", path: "/admin/orders" },
    { label: "Employees",     icon: "👥", path: "/admin/employees" },
    { label: "Customers",     icon: "👤", path: "/admin/customers" },
    { label: "Expenses",      icon: "💰", path: "/admin/expenses" },
    { label: "Audit Logs",    icon: "🛡️", path: "/admin/audit-logs" },
    { label: "User Manage",   icon: "⚙️", path: "/admin/users" },
    { label: "Register User", icon: "📝", path: "/admin/register-user" },
    { label: "Attendance",    icon: "🗓️", path: "/cashier/attendance" },
    { label: "Cashier Panel", icon: "⚡", path: "/cashier" },
  ],
  cashier: [
    { label: "Cashier Panel", icon: "⚡", path: "/cashier" },
    { label: "Attendance",    icon: "🗓️", path: "/cashier/attendance" },
  ],
};

function getInitials(name) {
  if (!name) return "?";
  return name.trim().split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [imgError, setImgError] = React.useState(false);
  const [minimized, setMinimized] = React.useState(
    () => localStorage.getItem("sb_minimized") === "true"
  );
  const [user, setUser] = React.useState({
    name:  localStorage.getItem("name")  || "",
    email: localStorage.getItem("email") || "",
    role:  localStorage.getItem("role")  || "cashier",
  });

  // Persist collapse preference
  React.useEffect(() => {
    localStorage.setItem("sb_minimized", minimized);
  }, [minimized]);

  // Fetch current user from API
  React.useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }

    axios
      .get("http://localhost:5000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const u = res.data;
        setUser({ name: u.name || "", email: u.email || "", role: u.role || "cashier" });
        localStorage.setItem("name",  u.name  || "");
        localStorage.setItem("email", u.email || "");
        localStorage.setItem("role",  u.role  || "cashier");
      })
      .catch((err) => {
        if (err?.response?.status === 401 || err?.response?.status === 403) {
          localStorage.clear();
          navigate("/login");
        }
      });
  }, []);

  const role      = user.role;
  const roleShort = role === "admin" ? "Captain" : "Crew";
  const navItems  = NAV[role] || NAV.cashier;

  const logout = async () => {
    const token = localStorage.getItem("token");
    try {
      if (token) {
        await axios.post(
          "http://localhost:5000/api/auth/logout",
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } catch (_) {}
    finally {
      localStorage.clear();
      navigate("/login");
    }
  };

  return (
    <>
      <style>{buildStyles(minimized)}</style>
      <div className={`sb-root${minimized ? " minimized" : ""}`}>

        {/* ── Starfield ── */}
        <div className="sb-stars">
          {STARS_DATA.map(s => (
            <div key={s.id} className="sb-star" style={{
              left: s.left, top: s.top,
              width: s.size, height: s.size,
              '--op': s.op,
              animationDuration: s.dur,
              animationDelay: s.delay,
            }} />
          ))}
        </div>

        {/* ── Toggle button — sits on the right border ── */}
        <button
          className="sb-toggle"
          onClick={() => setMinimized(m => !m)}
          title={minimized ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={minimized ? "Expand sidebar" : "Collapse sidebar"}
        >
          <span className="sb-toggle-arrow">◀</span>
        </button>

        {/* ══════════════════════════════════════════
             HEADER — logo always visible, text fades
        ══════════════════════════════════════════ */}
        <div className="sb-header">
          <div className="sb-logo-row">
            {!imgError ? (
              <img
                src="https://i.ibb.co/B2Mn4HSr/captains-marina-new-logo.png"
                alt="Captain's Cafe"
                className="sb-logo-img"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="sb-logo-fallback">⚓</div>
            )}
            <div className="sb-logo-text">
              <div className="sb-logo-name">CAPTAIN<span>'</span>S</div>
              <div className="sb-logo-sub">Café · Marina POS</div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════
             USER CARD — slides out when collapsed
        ══════════════════════════════════════════ */}
        <div className="sb-user-card">
          <div className="sb-uc-tl" /><div className="sb-uc-tr" />
          <div className="sb-uc-bl" /><div className="sb-uc-br" />
          <div className="sb-user-top">
            <div className="sb-avatar">{getInitials(user.name)}</div>
            <div className="sb-user-info">
              <div className="sb-user-name">{user.name || "Crew Member"}</div>
              {user.email && <div className="sb-user-email">{user.email}</div>}
            </div>
            <div className="sb-online-dot" title="Online" />
          </div>
          <div className="sb-role-badge">
            <span className="sb-role-anchor">⚓</span>
            <span className="sb-role-label">Position</span>
            <span className="sb-role-value">{roleShort}</span>
          </div>
        </div>

        {/* ── Mini user (only visible when collapsed) ── */}
        <div className="sb-mini-user">
          <div className="sb-mini-avatar">{getInitials(user.name)}</div>
          <div className="sb-mini-dot" />
        </div>

        {/* ══════════════════════════════════════════
             SECTION LABEL — fades out
        ══════════════════════════════════════════ */}
        <div className="sb-section-label">Navigation</div>

        {/* ══════════════════════════════════════════
             NAV — icon stays, label/pip fade out
             Tooltips appear when collapsed
        ══════════════════════════════════════════ */}
        <div className="sb-nav">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const showDiv  = role === "admin" && item.path === "/cashier";
            return (
              <React.Fragment key={item.path}>
                {showDiv && (
                  <div className="sb-divider">
                    <div className="sb-divider-line" />
                    <span className="sb-divider-icon">⚓</span>
                    <div className="sb-divider-line" />
                  </div>
                )}
                <button
                  className={`sb-btn${isActive ? " active" : ""}`}
                  onClick={() => navigate(item.path)}
                  title={minimized ? item.label : undefined}
                >
                  <span className="sb-btn-icon">{item.icon}</span>
                  <span className="sb-btn-label">{item.label}</span>
                  <span className="sb-btn-pip" />
                  {/* Floating tooltip shown only when minimized */}
                  <span className="sb-btn-tooltip">{item.label}</span>
                </button>
              </React.Fragment>
            );
          })}
        </div>

        {/* ══════════════════════════════════════════
             FOOTER
        ══════════════════════════════════════════ */}
        <div className="sb-footer">
          <button className="sb-logout" onClick={logout}>
            <span className="sb-logout-icon">⇠</span>
            <span className="sb-logout-label">Abandon Ship (Logout)</span>
            <span className="sb-logout-tooltip">Logout</span>
          </button>
          <div className="sb-footer-brand">
            <div className="sb-footer-company">Lexient Innovations</div>
            <div className="sb-footer-support">Support: <span>0778231121</span> · Sasindu</div>
          </div>
        </div>

      </div>
    </>
  );
}