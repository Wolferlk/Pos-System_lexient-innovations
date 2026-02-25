import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

  :root {
    --bg-base:      #0f1117;
    --bg-card:      #1a1d27;
    --bg-elevated:  #22263a;
    --bg-hover:     #2a2f45;
    --accent:       #f5a623;
    --accent-dim:   rgba(245,166,35,0.13);
    --accent-glow:  rgba(245,166,35,0.3);
    --danger:       #ef4444;
    --danger-dim:   rgba(239,68,68,0.12);
    --text-primary: #f0f2f8;
    --text-muted:   #6b7499;
    --text-dim:     #3d4263;
    --border:       rgba(255,255,255,0.06);
    --font:         'Sora', sans-serif;
    --mono:         'JetBrains Mono', monospace;
  }

  .sb-root {
    font-family: var(--font);
    width: 240px;
    min-width: 240px;
    height: 100vh;
    background: var(--bg-card);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    padding: 0;
    overflow: hidden;
    position: relative;
  }

  /* subtle gradient line at right edge */
  .sb-root::after {
    content: '';
    position: absolute;
    right: 0; top: 0; bottom: 0;
    width: 1px;
    background: linear-gradient(to bottom, transparent, var(--accent-dim), transparent);
    pointer-events: none;
  }

  /* ── LOGO ── */
  .sb-logo {
    padding: 28px 20px 24px;
    border-bottom: 1px solid var(--border);
  }
  .sb-logo-inner {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .sb-logo-icon {
    width: 36px; height: 36px;
    background: var(--accent);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px;
    box-shadow: 0 4px 14px var(--accent-glow);
    flex-shrink: 0;
  }
  .sb-logo-text { line-height: 1.2; }
  .sb-logo-name {
    font-size: 15px;
    font-weight: 700;
    color: var(--text-primary);
    letter-spacing: -0.3px;
  }
  .sb-logo-sub {
    font-size: 10px;
    color: var(--text-muted);
    font-family: var(--mono);
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }

  /* ── ROLE BADGE ── */
  .sb-role {
    margin: 16px 20px 0;
    display: flex;
    align-items: center;
    gap: 7px;
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 8px 12px;
  }
  .sb-role-dot {
    width: 7px; height: 7px;
    border-radius: 50%;
    background: var(--accent);
    box-shadow: 0 0 6px var(--accent-glow);
    flex-shrink: 0;
  }
  .sb-role-label {
    font-size: 11px;
    color: var(--text-muted);
    font-family: var(--mono);
    text-transform: uppercase;
    letter-spacing: 0.8px;
  }
  .sb-role-value {
    margin-left: auto;
    font-size: 11px;
    font-weight: 600;
    color: var(--accent);
    font-family: var(--mono);
    text-transform: capitalize;
  }

  /* ── SECTION LABEL ── */
  .sb-section-label {
    padding: 20px 20px 8px;
    font-size: 10px;
    font-weight: 600;
    color: var(--text-dim);
    text-transform: uppercase;
    letter-spacing: 1.2px;
    font-family: var(--mono);
  }

  /* ── NAV ITEMS ── */
  .sb-nav { flex: 1; overflow-y: auto; padding: 0 12px; }
  .sb-nav::-webkit-scrollbar { width: 0; }

  .sb-btn {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 11px 12px;
    border-radius: 10px;
    border: none;
    background: transparent;
    color: var(--text-muted);
    font-family: var(--font);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    text-align: left;
    transition: all .18s;
    margin-bottom: 2px;
    position: relative;
    overflow: hidden;
  }
  .sb-btn:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
  }
  .sb-btn.active {
    background: var(--accent-dim);
    color: var(--accent);
    border: 1px solid rgba(245,166,35,0.18);
  }
  .sb-btn.active .sb-btn-icon { opacity: 1; }
  .sb-btn-icon {
    font-size: 16px;
    width: 20px;
    text-align: center;
    flex-shrink: 0;
    opacity: 0.6;
    transition: opacity .18s;
  }
  .sb-btn:hover .sb-btn-icon { opacity: 1; }
  .sb-btn-label { flex: 1; }
  .sb-btn-pip {
    width: 5px; height: 5px;
    border-radius: 50%;
    background: var(--accent);
    opacity: 0;
    transition: opacity .18s;
  }
  .sb-btn.active .sb-btn-pip { opacity: 1; }

  /* ── DIVIDER ── */
  .sb-divider {
    height: 1px;
    background: var(--border);
    margin: 10px 12px;
  }

  /* ── FOOTER ── */
  .sb-footer {
    padding: 16px 12px 20px;
    border-top: 1px solid var(--border);
  }
  .sb-logout {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 11px 12px;
    border-radius: 10px;
    border: 1px solid transparent;
    background: transparent;
    color: var(--text-muted);
    font-family: var(--font);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    text-align: left;
    transition: all .18s;
  }
  .sb-logout:hover {
    background: var(--danger-dim);
    color: var(--danger);
    border-color: rgba(239,68,68,0.2);
  }
  .sb-logout-icon { font-size: 16px; width: 20px; text-align: center; }
`;

const NAV = {
  admin: [
    { label: "Dashboard",     icon: "◈",  path: "/admin" },
    { label: "Reports",       icon: "📊", path: "/admin/reports" },
    { label: "Manage Items",  icon: "🍽️", path: "/admin/items" },
    { label: "Order History", icon: "📋", path: "/admin/orders" },
    { label: "Employees",     icon: "👥", path: "/admin/employees" },
    { label: "Customers",     icon: "👥", path: "/admin/customers" },
    { label: "Expenses",       icon: "📊", path: "/admin/expenses" },
    { label: "Audit Logs",    icon: "🛡️", path: "/admin/audit-logs" },
    { label: "User Manage", icon: "⚡", path: "/admin/users" },
    { label: "Register User", icon: "📝", path: "/admin/register-user" },
    { label: "Attendance", icon: "🗓️", path: "/cashier/attendance" },
    { label: "Cashier Panel", icon: "⚡", path: "/cashier" },
  ],
  cashier: [
    { label: "Cashier Panel", icon: "⚡", path: "/cashier" },
    { label: "Attendance", icon: "🗓️", path: "/cashier/attendance" },
  ],
};

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem("role") || "cashier";

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
    } catch (_error) {
      // Logging failure should not block user logout from UI.
    } finally {
      localStorage.clear();
      navigate("/login");
    }
  };

  const navItems = NAV[role] || NAV.cashier;

  return (
    <>
      <style>{styles}</style>
      <div className="sb-root">

        {/* Logo */}
        <div className="sb-logo">
          <div className="sb-logo-inner">
            <div className="sb-logo-icon">🍽</div>
            <div className="sb-logo-text">
              <div className="sb-logo-name">QuickPOS</div>
              <div className="sb-logo-sub">Point of Sale</div>
            </div>
          </div>
        </div>

        {/* Role badge */}
        <div className="sb-role">
          <div className="sb-role-dot" />
          <span className="sb-role-label">Role</span>
          <span className="sb-role-value">{role}</span>
        </div>

        {/* Nav */}
        <div className="sb-nav">
          <div className="sb-section-label">Menu</div>

          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                className={`sb-btn ${isActive ? "active" : ""}`}
                onClick={() => navigate(item.path)}
              >
                <span className="sb-btn-icon">{item.icon}</span>
                <span className="sb-btn-label">{item.label}</span>
                <span className="sb-btn-pip" />
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="sb-footer">
          <button className="sb-logout" onClick={logout}>
            <span className="sb-logout-icon">⇠</span>
            Logout
          </button>
        </div>

      </div>
    </>
  );
}
