import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// ─── Inline Styles ────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=JetBrains+Mono:wght@400;500;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .lx-root {
    position: fixed; inset: 0; overflow: hidden;
    font-family: 'DM Sans', sans-serif;
    background: #06080f;
  }

  /* ── Animated Background ── */
  .lx-bg {
    position: absolute; inset: 0; z-index: 0;
    background:
      radial-gradient(ellipse 80% 60% at 20% 50%, rgba(255, 140, 30, 0.12) 0%, transparent 55%),
      radial-gradient(ellipse 60% 80% at 80% 30%, rgba(255, 200, 80, 0.06) 0%, transparent 50%),
      radial-gradient(ellipse 100% 100% at 50% 100%, rgba(20, 30, 60, 0.9) 0%, transparent 70%),
      linear-gradient(135deg, #06080f 0%, #0c1220 40%, #080d1a 100%);
  }

  /* Animated mesh grid */
  .lx-grid {
    position: absolute; inset: 0; z-index: 1;
    background-image:
      linear-gradient(rgba(255,140,30,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,140,30,0.04) 1px, transparent 1px);
    background-size: 60px 60px;
    animation: grid-drift 20s linear infinite;
    mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 80%);
  }
  @keyframes grid-drift {
    0%   { transform: translate(0, 0); }
    100% { transform: translate(60px, 60px); }
  }

  /* Floating orbs */
  .lx-orb {
    position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none; z-index: 1;
  }
  .lx-orb-1 {
    width: 500px; height: 500px;
    background: radial-gradient(circle, rgba(255,140,30,0.15), transparent 70%);
    top: -100px; left: -100px;
    animation: orb-float-1 18s ease-in-out infinite;
  }
  .lx-orb-2 {
    width: 400px; height: 400px;
    background: radial-gradient(circle, rgba(255,200,60,0.10), transparent 70%);
    bottom: -50px; right: -50px;
    animation: orb-float-2 22s ease-in-out infinite;
  }
  .lx-orb-3 {
    width: 300px; height: 300px;
    background: radial-gradient(circle, rgba(100,160,255,0.08), transparent 70%);
    top: 40%; left: 60%;
    animation: orb-float-3 15s ease-in-out infinite;
  }
  @keyframes orb-float-1 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(80px,60px) scale(1.1)} }
  @keyframes orb-float-2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-60px,-80px) scale(1.15)} }
  @keyframes orb-float-3 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-40px,50px) scale(0.9)} }

  /* Floating particles */
  .lx-particles { position: absolute; inset: 0; z-index: 2; pointer-events: none; overflow: hidden; }
  .lx-particle {
    position: absolute; border-radius: 50%;
    background: rgba(255,160,40,0.6);
    animation: particle-rise linear infinite;
  }
  @keyframes particle-rise {
    0%   { transform: translateY(0) translateX(0) scale(1); opacity: 0; }
    10%  { opacity: 1; }
    90%  { opacity: 0.4; }
    100% { transform: translateY(-100vh) translateX(var(--dx)) scale(0.3); opacity: 0; }
  }

  /* ── Layout ── */
  .lx-layout {
    position: relative; z-index: 10;
    display: grid; grid-template-columns: 1fr 480px;
    height: 100vh;
  }
  @media (max-width: 900px) {
    .lx-layout { grid-template-columns: 1fr; }
    .lx-left { display: none; }
  }

  /* ── Left Panel ── */
  .lx-left {
    display: flex; flex-direction: column;
    justify-content: center; align-items: flex-start;
    padding: 60px 80px;
    animation: fade-up 1s ease both;
  }
  @keyframes fade-up { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }

  .lx-brand-badge {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(255,140,30,0.1); border: 1px solid rgba(255,140,30,0.25);
    border-radius: 30px; padding: 7px 16px; margin-bottom: 32px;
    animation: fade-up 1s ease .15s both;
  }
  .lx-brand-dot { width: 8px; height: 8px; border-radius: 50%; background: #ff8c1e; box-shadow: 0 0 10px #ff8c1e; animation: pulse-b 2s infinite; }
  @keyframes pulse-b { 0%,100%{opacity:1;box-shadow:0 0 6px #ff8c1e} 50%{opacity:.5;box-shadow:0 0 20px #ff8c1e} }
  .lx-brand-badge-text { font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 500; color: #ff8c1e; letter-spacing: 2px; text-transform: uppercase; }

  .lx-headline {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(52px, 5.5vw, 80px);
    font-weight: 700; line-height: 1.0; letter-spacing: -2px;
    color: #f0e8d8;
    margin-bottom: 8px;
    animation: fade-up 1s ease .25s both;
  }
  .lx-headline em { font-style: italic; color: #ff8c1e; }
  .lx-headline-2 {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(48px, 5vw, 76px);
    font-weight: 300; line-height: 1.0; letter-spacing: -2px;
    color: rgba(240,232,216,0.35);
    margin-bottom: 28px;
    animation: fade-up 1s ease .35s both;
  }

  .lx-desc {
    font-size: 14px; font-weight: 300; color: rgba(200,210,230,0.55);
    line-height: 1.7; max-width: 380px;
    animation: fade-up 1s ease .45s both;
    margin-bottom: 40px;
  }

  /* Stat pills */
  .lx-stats { display: flex; gap: 12px; flex-wrap: wrap; animation: fade-up 1s ease .55s both; }
  .lx-stat {
    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px; padding: 12px 18px;
    backdrop-filter: blur(10px);
  }
  .lx-stat-val { font-family: 'JetBrains Mono', monospace; font-size: 20px; font-weight: 700; color: #ff8c1e; }
  .lx-stat-label { font-size: 10px; color: rgba(200,210,230,0.4); font-weight: 500; letter-spacing: 1px; text-transform: uppercase; margin-top: 2px; }

  /* POS decorative terminal */
  .lx-terminal {
    margin-top: 48px;
    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
    border-radius: 14px; padding: 16px 20px; max-width: 340px;
    font-family: 'JetBrains Mono', monospace;
    animation: fade-up 1s ease .65s both;
  }
  .lx-terminal-bar { display: flex; align-items: center; gap: 6px; margin-bottom: 12px; }
  .lx-terminal-dot { width: 8px; height: 8px; border-radius: 50%; }
  .lx-terminal-line { font-size: 10px; color: rgba(200,210,230,0.25); line-height: 1.8; }
  .lx-terminal-line .green { color: #34d399; }
  .lx-terminal-line .amber { color: #ff8c1e; }
  .lx-terminal-line .dim { color: rgba(200,210,230,0.15); }
  .lx-cursor { display: inline-block; width: 7px; height: 12px; background: #ff8c1e; vertical-align: middle; animation: blink .8s step-end infinite; }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }

  /* ── Right Panel / Glass Card ── */
  .lx-right {
    display: flex; align-items: center; justify-content: center;
    padding: 40px 40px;
    position: relative;
  }

  .lx-glass-card {
    width: 100%; max-width: 400px;
    background: rgba(14, 20, 38, 0.75);
    backdrop-filter: blur(40px) saturate(180%);
    -webkit-backdrop-filter: blur(40px) saturate(180%);
    border: 1px solid rgba(255,255,255,0.10);
    border-top-color: rgba(255,255,255,0.18);
    border-radius: 28px;
    padding: 44px 40px;
    box-shadow:
      0 40px 80px rgba(0,0,0,0.7),
      0 0 0 1px rgba(255,255,255,0.04),
      inset 0 1px 0 rgba(255,255,255,0.1);
    animation: card-in .8s cubic-bezier(.22,1,.36,1) .2s both;
    position: relative; overflow: hidden;
  }
  @keyframes card-in { from{opacity:0;transform:translateY(40px) scale(0.96)} to{opacity:1;transform:translateY(0) scale(1)} }

  /* Card shimmer border */
  .lx-glass-card::before {
    content: '';
    position: absolute; top: 0; left: -100%; width: 60%; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,140,30,0.6), transparent);
    animation: shimmer-line 4s ease-in-out infinite;
  }
  @keyframes shimmer-line { 0%{left:-100%} 100%{left:200%} }

  /* Card glow */
  .lx-glass-card::after {
    content: '';
    position: absolute; inset: 0; border-radius: 28px; pointer-events: none;
    background: radial-gradient(ellipse 100% 60% at 50% 0%, rgba(255,140,30,0.06), transparent 60%);
  }

  /* Logo area */
  .lx-card-logo { text-align: center; margin-bottom: 36px; animation: fade-up .6s ease .5s both; }
  .lx-logo-mark {
    width: 64px; height: 64px; margin: 0 auto 16px;
    background: linear-gradient(135deg, #ff8c1e, #ffd060);
    border-radius: 20px;
    display: flex; align-items: center; justify-content: center;
    font-size: 28px;
    box-shadow: 0 12px 32px rgba(255,140,30,0.35), 0 0 0 1px rgba(255,200,80,0.3);
    position: relative; overflow: hidden;
  }
  .lx-logo-mark::before {
    content: '';
    position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
    background: linear-gradient(135deg, rgba(255,255,255,0.25) 0%, transparent 50%);
  }
  .lx-card-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 26px; font-weight: 700; letter-spacing: -0.5px;
    color: #f0e8d8;
    line-height: 1.1;
  }
  .lx-card-title span { color: #ff8c1e; }
  .lx-card-sub { font-size: 11px; color: rgba(200,210,230,0.4); margin-top: 5px; letter-spacing: 1.5px; text-transform: uppercase; font-weight: 500; }

  /* Form */
  .lx-form { display: flex; flex-direction: column; gap: 16px; animation: fade-up .6s ease .6s both; }

  .lx-field { display: flex; flex-direction: column; gap: 6px; }
  .lx-label { font-size: 10px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; color: rgba(200,210,230,0.5); }

  .lx-input-wrap { position: relative; }
  .lx-input-icon {
    position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
    opacity: 0.35; pointer-events: none; font-size: 14px;
    transition: opacity .2s;
  }
  .lx-input {
    width: 100%;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.10);
    border-radius: 14px;
    color: #e8edf8;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px; font-weight: 400;
    padding: 14px 14px 14px 42px;
    outline: none;
    transition: all .2s;
    -webkit-text-fill-color: #e8edf8;
  }
  .lx-input:-webkit-autofill {
    -webkit-box-shadow: 0 0 0 100px rgba(14,20,38,0.9) inset;
    -webkit-text-fill-color: #e8edf8;
  }
  .lx-input::placeholder { color: rgba(200,210,230,0.25); }
  .lx-input:focus {
    border-color: rgba(255,140,30,0.5);
    background: rgba(255,255,255,0.07);
    box-shadow: 0 0 0 3px rgba(255,140,30,0.12), 0 2px 12px rgba(0,0,0,0.3);
  }
  .lx-input-wrap:focus-within .lx-input-icon { opacity: 0.7; }

  /* Password toggle */
  .lx-eye {
    position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
    background: none; border: none; cursor: pointer;
    color: rgba(200,210,230,0.3); font-size: 14px; padding: 4px;
    transition: color .18s;
  }
  .lx-eye:hover { color: rgba(200,210,230,0.7); }

  /* Error */
  .lx-error {
    background: rgba(255,80,80,0.12); border: 1px solid rgba(255,80,80,0.25);
    border-radius: 10px; padding: 10px 14px;
    font-size: 12px; color: #ff8080;
    display: flex; align-items: center; gap: 8px;
    animation: shake .4s ease;
  }
  @keyframes shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-6px)} 40%,80%{transform:translateX(6px)} }

  /* Submit button */
  .lx-submit {
    width: 100%; padding: 15px;
    background: linear-gradient(135deg, #ff8c1e, #ffb347);
    border: none; border-radius: 14px;
    color: #0a0800; font-family: 'DM Sans', sans-serif;
    font-size: 14px; font-weight: 700; letter-spacing: 0.3px;
    cursor: pointer; position: relative; overflow: hidden;
    transition: all .2s;
    box-shadow: 0 8px 24px rgba(255,140,30,0.4), 0 2px 6px rgba(0,0,0,0.3);
    margin-top: 4px;
  }
  .lx-submit::before {
    content: '';
    position: absolute; top: 0; left: -100%; width: 60%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
    transition: left .4s;
  }
  .lx-submit:hover { transform: translateY(-1px); box-shadow: 0 14px 32px rgba(255,140,30,0.5); filter: brightness(1.05); }
  .lx-submit:hover::before { left: 160%; }
  .lx-submit:active { transform: scale(0.98); }
  .lx-submit:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }
  .lx-submit-inner { display: flex; align-items: center; justify-content: center; gap: 8px; }

  /* Loading spinner */
  .lx-spinner {
    width: 16px; height: 16px; border: 2px solid rgba(10,8,0,0.3);
    border-top-color: rgba(10,8,0,0.9); border-radius: 50%;
    animation: spin .6s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* Footer */
  .lx-footer {
    text-align: center; margin-top: 28px;
    animation: fade-up .6s ease .8s both;
  }
  .lx-footer-brand {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px; color: rgba(200,210,230,0.2);
    letter-spacing: 2px; text-transform: uppercase;
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .lx-footer-brand::before, .lx-footer-brand::after {
    content: ''; flex: 1; height: 1px; background: rgba(255,255,255,0.06);
  }
  .lx-footer-copy {
    font-size: 10px; color: rgba(200,210,230,0.15); margin-top: 6px;
  }

  /* Decorative receipt */
  .lx-receipt-deco {
    position: absolute; right: -20px; top: 50%; transform: translateY(-50%) rotate(6deg);
    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);
    border-radius: 8px; padding: 14px 12px; width: 130px; z-index: -1;
    font-family: 'JetBrains Mono', monospace;
    animation: receipt-float 6s ease-in-out infinite;
  }
  @keyframes receipt-float { 0%,100%{transform:translateY(-50%) rotate(6deg)} 50%{transform:translateY(calc(-50% - 10px)) rotate(4deg)} }
  .lx-receipt-line { font-size: 7px; color: rgba(255,255,255,0.12); margin-bottom: 4px; border-bottom: 1px dashed rgba(255,255,255,0.05); padding-bottom: 4px; }
  .lx-receipt-total { font-size: 9px; color: rgba(255,140,30,0.4); font-weight: 700; margin-top: 4px; }
`;

// ─── Particle config ──────────────────────────────────────────────────────────
const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  width: `${2 + Math.random() * 3}px`,
  height: `${2 + Math.random() * 3}px`,
  duration: `${8 + Math.random() * 14}s`,
  delay: `${Math.random() * 12}s`,
  dx: `${(Math.random() - 0.5) * 80}px`,
  opacity: 0.3 + Math.random() * 0.5,
  bottom: `${Math.random() * 30}%`,
}));

// ─── Terminal lines ────────────────────────────────────────────────────────────
const TERMINAL_LINES = [
  { text: "$ QuickPOS v3.1.0 — initialized", cls: "green" },
  { text: "✓ Database connection established", cls: "green" },
  { text: "✓ Menu loaded — 48 items active", cls: "green" },
  { text: "✓ Payment gateway online", cls: "green" },
  { text: "» Awaiting authentication...", cls: "amber" },
];

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [termLine, setTermLine] = useState(0);
  const navigate = useNavigate();

  // Animate terminal lines one by one
  useEffect(() => {
    if (termLine < TERMINAL_LINES.length) {
      const t = setTimeout(() => setTermLine(l => l + 1), 600 + termLine * 400);
      return () => clearTimeout(t);
    }
  }, [termLine]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError("Please enter your email and password."); return; }
    setLoading(true); setError("");
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", { email, password });
      if (!res?.data?.token || !res?.data?.user?.role) {
        throw new Error("Invalid login response");
      }
      localStorage.setItem("token", res.data.token);
      const role = String(res.data.user.role || "").toLowerCase();
      localStorage.setItem("role", role);
      if (role === "admin") navigate("/admin");
      else navigate("/cashier");
    } catch (err) {
      const status = err?.response?.status;
      if (status === 400 || status === 401 || status === 404) {
        setError("Invalid email or password. Please try again.");
      } else if (status === 403) {
        setError("Your account is disabled. Please contact admin.");
      } else if (status === 503) {
        setError(err?.response?.data?.message || "Cloud database unavailable.");
      } else {
        setError(err?.response?.data?.message || "Unable to connect. Check your network and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="lx-root">

        {/* Background layers */}
        <div className="lx-bg" />
        <div className="lx-grid" />
        <div className="lx-orb lx-orb-1" />
        <div className="lx-orb lx-orb-2" />
        <div className="lx-orb lx-orb-3" />

        {/* Particles */}
        <div className="lx-particles">
          {PARTICLES.map(p => (
            <div key={p.id} className="lx-particle" style={{
              left: p.left,
              bottom: p.bottom,
              width: p.width,
              height: p.height,
              "--dx": p.dx,
              animationDuration: p.duration,
              animationDelay: p.delay,
              opacity: p.opacity,
            }} />
          ))}
        </div>

        {/* Layout */}
        <div className="lx-layout">

          {/* ── LEFT ── */}
          <div className="lx-left">

            <div className="lx-brand-badge">
              <div className="lx-brand-dot" />
              <span className="lx-brand-badge-text">Lexient Innovations</span>
            </div>

            <div className="lx-headline">Quick<em>POS</em></div>
            <div className="lx-headline-2">Restaurant Suite</div>

            <p className="lx-desc">
              A complete point-of-sale ecosystem for modern restaurants —
              lightning-fast billing, real-time inventory, and insightful
              analytics all in one elegant system.
            </p>

            <div className="lx-stats">
              <div className="lx-stat">
                <div className="lx-stat-val">48ms</div>
                <div className="lx-stat-label">Avg. Bill Time</div>
              </div>
              <div className="lx-stat">
                <div className="lx-stat-val">99.9%</div>
                <div className="lx-stat-label">Uptime</div>
              </div>
              <div className="lx-stat">
                <div className="lx-stat-val">6+</div>
                <div className="lx-stat-label">Pay Methods</div>
              </div>
            </div>

            {/* Terminal */}
            <div className="lx-terminal">
              <div className="lx-terminal-bar">
                <div className="lx-terminal-dot" style={{background:"#ff5f57"}} />
                <div className="lx-terminal-dot" style={{background:"#febc2e"}} />
                <div className="lx-terminal-dot" style={{background:"#28c840"}} />
                <span style={{marginLeft:8,fontSize:9,color:"rgba(200,210,230,0.2)",fontFamily:"JetBrains Mono"}}>pos-system — bash</span>
              </div>
              {TERMINAL_LINES.slice(0, termLine).map((line, i) => (
                <div key={i} className={`lx-terminal-line ${line.cls}`}>
                  {line.text}
                </div>
              ))}
              {termLine < TERMINAL_LINES.length && (
                <div className="lx-terminal-line"><span className="lx-cursor" /></div>
              )}
              {termLine >= TERMINAL_LINES.length && (
                <div className="lx-terminal-line amber">» <span className="lx-cursor" /></div>
              )}
            </div>

          </div>

          {/* ── RIGHT ── */}
          <div className="lx-right">

            {/* Decorative receipt behind card */}
            <div className="lx-receipt-deco" aria-hidden="true">
              <div className="lx-receipt-line">QUICKPOS SYSTEM</div>
              <div className="lx-receipt-line">TABLE: 04 | DINE-IN</div>
              <div className="lx-receipt-line">Chicken Rice × 2</div>
              <div className="lx-receipt-line">Iced Latte × 1</div>
              <div className="lx-receipt-line">Beef Burger × 1</div>
              <div className="lx-receipt-line">Discount: 10%</div>
              <div className="lx-receipt-total">TOTAL: Rs. 2,640</div>
            </div>

            <div className="lx-glass-card">

              {/* Logo */}
              <div className="lx-card-logo">
                <div className="lx-logo-mark">🧾</div>
                <div className="lx-card-title">Quick<span>POS</span></div>
                <div className="lx-card-sub">POS System by Lexient Innovations</div>
              </div>

              {/* Form */}
              <form onSubmit={handleLogin} className="lx-form" autoComplete="off">

                {error && (
                  <div className="lx-error">
                    <span>⚠</span> {error}
                  </div>
                )}

                {/* Email */}
                <div className="lx-field">
                  <label className="lx-label">Email Address</label>
                  <div className="lx-input-wrap">
                    <span className="lx-input-icon">✉</span>
                    <input
                      className="lx-input"
                      type="email"
                      placeholder="admin@restaurant.com"
                      value={email}
                      onChange={e => { setEmail(e.target.value); setError(""); }}
                      autoComplete="username"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="lx-field">
                  <label className="lx-label">Password</label>
                  <div className="lx-input-wrap">
                    <span className="lx-input-icon">🔒</span>
                    <input
                      className="lx-input"
                      type={showPass ? "text" : "password"}
                      placeholder="••••••••••"
                      value={password}
                      onChange={e => { setPassword(e.target.value); setError(""); }}
                      autoComplete="current-password"
                    />
                    <button type="button" className="lx-eye" onClick={() => setShowPass(p => !p)}
                      title={showPass ? "Hide password" : "Show password"}>
                      {showPass ? "🙈" : "👁"}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button type="submit" className="lx-submit" disabled={loading}>
                  <div className="lx-submit-inner">
                    {loading
                      ? <><div className="lx-spinner" /> Signing in...</>
                      : <>Sign In to POS <span style={{fontSize:16}}>→</span></>
                    }
                  </div>
                </button>

              </form>

              {/* Footer */}
              <div className="lx-footer">
                <div className="lx-footer-brand">Lexient Innovations</div>
                <div className="lx-footer-copy">© 2025 QuickPOS · All rights reserved</div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
