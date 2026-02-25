import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import MainLayout from "../layout/MainLayout";

const styles = `
  .rg-page {
    min-height: calc(100vh - 56px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }
  .rg-card {
    width: 100%;
    max-width: 520px;
    background: rgba(17, 22, 34, 0.9);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px;
    padding: 26px;
    color: #e8ecff;
    box-shadow: 0 20px 55px rgba(0,0,0,0.35);
  }
  .rg-title { font-size: 28px; font-weight: 800; letter-spacing: -0.5px; }
  .rg-sub { margin-top: 6px; color: #8d97be; font-size: 13px; }
  .rg-grid { margin-top: 18px; display: grid; gap: 12px; }
  .rg-label { font-size: 12px; color: #95a0c8; margin-bottom: 6px; display: block; }
  .rg-input, .rg-select {
    width: 100%;
    padding: 11px 12px;
    border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.1);
    background: #171c2c;
    color: #e8ecff;
    outline: none;
  }
  .rg-input:focus, .rg-select:focus { border-color: rgba(245,166,35,0.6); }
  .rg-row { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 16px; }
  .rg-btn {
    border: none;
    border-radius: 10px;
    padding: 11px 14px;
    font-weight: 700;
    cursor: pointer;
  }
  .rg-primary { background: #f5a623; color: #111; flex: 1; min-width: 140px; }
  .rg-secondary { background: #1d2336; color: #9ea7cc; min-width: 120px; }
  .rg-ok {
    margin-top: 14px;
    padding: 10px 12px;
    border-radius: 10px;
    font-size: 13px;
    background: rgba(34,197,94,0.14);
    color: #9be7b4;
    border: 1px solid rgba(34,197,94,0.34);
  }
  .rg-err {
    margin-top: 14px;
    padding: 10px 12px;
    border-radius: 10px;
    font-size: 13px;
    background: rgba(239,68,68,0.14);
    color: #ffb2bb;
    border: 1px solid rgba(239,68,68,0.34);
  }
  .rg-standalone {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: radial-gradient(circle at 20% 20%, rgba(245,166,35,0.08), transparent 45%), #0f1117;
    padding: 20px;
  }
`;

function RegisterForm({ insideAdmin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("cashier");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");
    try {
      await axios.post(
        "http://localhost:5000/api/auth/register",
        { name, email, password, role },
        token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
      );

      setSuccess("User registered successfully.");
      setName("");
      setEmail("");
      setPassword("");
      setRole("cashier");

      if (!insideAdmin) {
        setTimeout(() => navigate("/login"), 700);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className={insideAdmin ? "rg-page" : "rg-standalone"}>
        <form className="rg-card" onSubmit={handleRegister}>
          <div className="rg-title">Register User</div>
          <div className="rg-sub">
            {insideAdmin
              ? "Create new staff accounts directly from admin panel."
              : "Create a new account to access the POS system."}
          </div>

          <div className="rg-grid">
            <div>
              <label className="rg-label">Full Name</label>
              <input className="rg-input" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <label className="rg-label">Email</label>
              <input className="rg-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="rg-label">Password</label>
              <input className="rg-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div>
              <label className="rg-label">Role</label>
              <select className="rg-select" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="cashier">Cashier</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <div className="rg-row">
            <button className="rg-btn rg-primary" type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create User"}
            </button>
            <button
              className="rg-btn rg-secondary"
              type="button"
              onClick={() => navigate(insideAdmin ? "/admin/users" : "/login")}
            >
              {insideAdmin ? "Back to Users" : "Back to Login"}
            </button>
          </div>

          {success && <div className="rg-ok">{success}</div>}
          {error && <div className="rg-err">{error}</div>}
        </form>
      </div>
    </>
  );
}

export default function Register() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin/");
  return isAdminRoute ? (
    <MainLayout>
      <RegisterForm insideAdmin />
    </MainLayout>
  ) : (
    <RegisterForm insideAdmin={false} />
  );
}
