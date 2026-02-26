import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// ─── Inline Styles ────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Crimson+Text:ital,wght@0,400;0,600;1,400;1,600&family=Share+Tech+Mono&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --navy: #0a1628;
    --deep-navy: #060e1c;
    --ocean: #0d2244;
    --gold: #c9943a;
    --gold-light: #e8b84b;
    --gold-bright: #f5d070;
    --sky-blue: #5bb8f5;
    --sky-glow: #7dd3f7;
    --rope: #b8976a;
    --white: #f0f4f8;
    --muted: rgba(176,200,230,0.55);
  }

  .cm-root {
    position: fixed; inset: 0; overflow: hidden;
    font-family: 'Crimson Text', serif;
    background: var(--deep-navy);
  }

  /* ── Ocean Background ── */
  .cm-bg {
    position: absolute; inset: 0; z-index: 0;
    background:
      radial-gradient(ellipse 120% 60% at 50% 100%, rgba(13,34,68,1) 0%, transparent 60%),
      radial-gradient(ellipse 80% 40% at 20% 80%, rgba(10,22,40,0.9) 0%, transparent 55%),
      radial-gradient(ellipse 60% 50% at 80% 20%, rgba(91,184,245,0.06) 0%, transparent 50%),
      linear-gradient(180deg, #04080f 0%, #060e1c 35%, #0a1628 65%, #0d2244 100%);
  }

  /* Stars */
  .cm-stars {
    position: absolute; inset: 0; z-index: 1; pointer-events: none;
    overflow: hidden;
  }
  .cm-star {
    position: absolute; border-radius: 50%;
    background: white;
    animation: star-twinkle ease-in-out infinite;
  }
  @keyframes star-twinkle {
    0%,100% { opacity: var(--base-op); transform: scale(1); }
    50% { opacity: calc(var(--base-op) * 0.2); transform: scale(0.6); }
  }

  /* Ocean waves at bottom */
  .cm-ocean {
    position: absolute; bottom: 0; left: 0; right: 0; height: 220px; z-index: 2;
    overflow: hidden;
  }
  .cm-wave {
    position: absolute; bottom: 0; left: -100%; width: 300%;
    border-radius: 40% 60% 40% 60% / 30% 30% 70% 70%;
    animation: wave-roll linear infinite;
    transform-origin: center bottom;
  }
  .cm-wave-1 {
    height: 80px;
    background: rgba(91,184,245,0.07);
    animation-duration: 12s;
    bottom: 0;
  }
  .cm-wave-2 {
    height: 60px;
    background: rgba(91,184,245,0.05);
    animation-duration: 16s;
    animation-direction: reverse;
    bottom: 20px;
  }
  .cm-wave-3 {
    height: 45px;
    background: rgba(201,148,58,0.04);
    animation-duration: 10s;
    bottom: 40px;
  }
  @keyframes wave-roll {
    0%   { transform: translateX(0) scaleY(1); }
    50%  { transform: translateX(15%) scaleY(1.1); }
    100% { transform: translateX(33.33%) scaleY(1); }
  }

  /* Moon glow */
  .cm-moon {
    position: absolute; top: 6%; right: 12%; z-index: 3;
    width: 90px; height: 90px; border-radius: 50%;
    background: radial-gradient(circle at 35% 35%, #ffeaa0, #e8c84a 40%, #c9943a 70%, rgba(201,148,58,0.2));
    box-shadow:
      0 0 40px 20px rgba(201,148,58,0.15),
      0 0 100px 50px rgba(201,148,58,0.06);
    animation: moon-glow 8s ease-in-out infinite;
  }
  @keyframes moon-glow {
    0%,100% { box-shadow: 0 0 40px 20px rgba(201,148,58,0.15), 0 0 100px 50px rgba(201,148,58,0.06); }
    50% { box-shadow: 0 0 60px 30px rgba(201,148,58,0.22), 0 0 140px 70px rgba(201,148,58,0.09); }
  }

  /* Moon reflection on water */
  .cm-reflection {
    position: absolute; bottom: 0; right: 12%; width: 90px; z-index: 2;
    height: 180px;
    background: linear-gradient(180deg, rgba(201,148,58,0.18) 0%, transparent 100%);
    filter: blur(8px);
    animation: reflection-shimmer 4s ease-in-out infinite;
    transform-origin: top center;
  }
  @keyframes reflection-shimmer {
    0%,100% { transform: scaleX(1) skewX(0deg); opacity: 1; }
    33% { transform: scaleX(1.3) skewX(3deg); opacity: 0.7; }
    66% { transform: scaleX(0.8) skewX(-2deg); opacity: 0.9; }
  }

  /* Floating boat silhouette */
  .cm-boat {
    position: absolute; bottom: 48px; left: 5%; z-index: 4;
    width: 160px; height: 80px;
    opacity: 0.15;
    animation: boat-float 8s ease-in-out infinite;
  }
  @keyframes boat-float {
    0%,100% { transform: translateY(0) rotate(-1deg); }
    50% { transform: translateY(-8px) rotate(1deg); }
  }

  /* Lighthouse on right */
  .cm-lighthouse {
    position: absolute; bottom: 60px; right: 5%; z-index: 3;
    width: 30px;
    opacity: 0.2;
  }

  /* ── Layout ── */
  .cm-layout {
    position: relative; z-index: 10;
    display: grid; grid-template-columns: 1fr 460px;
    height: 100vh;
    align-items: center;
  }
  @media (max-width: 900px) {
    .cm-layout { grid-template-columns: 1fr; }
    .cm-left { display: none; }
  }

  /* ── Left Panel ── */
  .cm-left {
    display: flex; flex-direction: column;
    justify-content: center; align-items: flex-start;
    padding: 60px 60px 60px 80px;
    animation: sail-in 1s ease both;
  }
  @keyframes sail-in { from{opacity:0;transform:translateX(-40px)} to{opacity:1;transform:translateX(0)} }

  /* Nautical rope divider */
  .cm-rope-top {
    display: flex; align-items: center; gap: 12px; margin-bottom: 28px;
    animation: sail-in 1s ease .1s both;
  }
  .cm-rope-knot {
    width: 10px; height: 10px; border-radius: 50%;
    background: var(--rope); box-shadow: 0 0 8px rgba(184,151,106,0.5);
  }
  .cm-rope-line {
    flex: 1; height: 2px; max-width: 200px;
    background: repeating-linear-gradient(90deg, var(--rope) 0px, var(--rope) 6px, transparent 6px, transparent 10px);
    opacity: 0.5;
  }
  .cm-rope-tag {
    font-family: 'Share Tech Mono', monospace;
    font-size: 9px; color: var(--rope); letter-spacing: 2.5px;
    text-transform: uppercase; opacity: 0.7;
  }

  /* Restaurant name */
  .cm-restaurant-badge {
    display: inline-flex; align-items: center; gap: 10px;
    background: rgba(201,148,58,0.08);
    border: 1px solid rgba(201,148,58,0.2);
    border-radius: 4px; padding: 8px 18px; margin-bottom: 24px;
    animation: sail-in 1s ease .2s both;
  }
  .cm-badge-anchor { font-size: 16px; }
  .cm-badge-text {
    font-family: 'Share Tech Mono', monospace;
    font-size: 10px; color: var(--gold-light); letter-spacing: 3px;
    text-transform: uppercase;
  }

  .cm-headline {
    font-family: 'Cinzel', serif;
    font-size: clamp(48px, 5vw, 72px);
    font-weight: 900; line-height: 1.0;
    color: var(--white);
    letter-spacing: 3px;
    margin-bottom: 4px;
    animation: sail-in 1s ease .3s both;
    text-shadow: 0 2px 20px rgba(91,184,245,0.2);
  }
  .cm-headline-apostrophe { color: var(--gold-light); }
  .cm-headline-2 {
    font-family: 'Cinzel', serif;
    font-size: clamp(28px, 3vw, 44px);
    font-weight: 400; letter-spacing: 8px;
    color: var(--sky-blue);
    text-transform: uppercase;
    margin-bottom: 4px;
    animation: sail-in 1s ease .4s both;
    text-shadow: 0 0 30px rgba(91,184,245,0.4);
  }
  .cm-tagline {
    font-family: 'Crimson Text', serif;
    font-style: italic;
    font-size: 15px; color: rgba(176,200,230,0.45);
    letter-spacing: 1px; margin-bottom: 36px;
    animation: sail-in 1s ease .45s both;
  }

  .cm-desc {
    font-size: 15px; font-weight: 400; color: var(--muted);
    line-height: 1.8; max-width: 380px;
    animation: sail-in 1s ease .5s both;
    margin-bottom: 36px;
  }

  /* Stat cards */
  .cm-stats { display: flex; gap: 10px; flex-wrap: wrap; animation: sail-in 1s ease .55s both; margin-bottom: 36px; }
  .cm-stat {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(201,148,58,0.15);
    border-top-color: rgba(201,148,58,0.3);
    border-radius: 4px; padding: 12px 20px;
    position: relative; overflow: hidden;
  }
  .cm-stat::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, var(--gold), transparent);
    opacity: 0.4;
  }
  .cm-stat-val {
    font-family: 'Share Tech Mono', monospace;
    font-size: 22px; color: var(--gold-light);
    text-shadow: 0 0 15px rgba(201,148,58,0.4);
  }
  .cm-stat-label { font-size: 10px; color: rgba(176,200,230,0.35); letter-spacing: 1.5px; text-transform: uppercase; margin-top: 2px; font-family: 'Share Tech Mono', monospace; }

  /* System status terminal */
  .cm-status-panel {
    background: rgba(6,14,28,0.8);
    border: 1px solid rgba(91,184,245,0.15);
    border-radius: 4px; padding: 16px 20px; max-width: 380px; width: 100%;
    font-family: 'Share Tech Mono', monospace;
    animation: sail-in 1s ease .65s both;
    position: relative; overflow: hidden;
  }
  .cm-status-panel::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(91,184,245,0.5), transparent);
  }
  .cm-status-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 14px; padding-bottom: 10px;
    border-bottom: 1px solid rgba(91,184,245,0.1);
  }
  .cm-status-title { font-size: 9px; color: rgba(91,184,245,0.6); letter-spacing: 3px; text-transform: uppercase; }
  .cm-blink-dot { width: 6px; height: 6px; border-radius: 50%; background: #34d399; box-shadow: 0 0 8px #34d399; animation: blink-pulse 2s infinite; }
  @keyframes blink-pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }

  .cm-status-row {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 8px; font-size: 10px;
  }
  .cm-status-key { color: rgba(176,200,230,0.4); letter-spacing: 1px; }
  .cm-status-val { font-weight: 500; }
  .cm-status-val.online { color: #34d399; }
  .cm-status-val.offline { color: #f87171; }
  .cm-status-val.gold { color: var(--gold-light); }
  .cm-status-val.blue { color: var(--sky-blue); }

  .cm-ping-bar {
    display: flex; align-items: center; gap: 3px; margin-top: 2px;
  }
  .cm-ping-seg {
    height: 8px; width: 3px; border-radius: 1px;
    background: rgba(176,200,230,0.15);
  }
  .cm-ping-seg.active { background: #34d399; box-shadow: 0 0 4px #34d399; }

  /* ── Right Panel ── */
  .cm-right {
    display: flex; align-items: center; justify-content: center;
    padding: 32px 48px 32px 24px;
    position: relative;
  }

  /* Nautical compass decoration */
  .cm-compass {
    position: absolute; top: -40px; right: -40px; width: 200px; height: 200px;
    border-radius: 50%;
    border: 1px solid rgba(201,148,58,0.08);
    opacity: 0.3;
    animation: compass-spin 60s linear infinite;
    pointer-events: none;
  }
  .cm-compass::before {
    content: '';
    position: absolute; inset: 10px; border-radius: 50%;
    border: 1px dashed rgba(201,148,58,0.15);
  }
  @keyframes compass-spin { to { transform: rotate(360deg); } }

  /* Glass card */
  .cm-glass-card {
    width: 100%; max-width: 400px;
    background: rgba(6, 14, 28, 0.82);
    backdrop-filter: blur(40px) saturate(160%);
    -webkit-backdrop-filter: blur(40px) saturate(160%);
    border: 1px solid rgba(255,255,255,0.08);
    border-top-color: rgba(201,148,58,0.3);
    border-radius: 4px;
    padding: 40px 36px;
    box-shadow:
      0 40px 80px rgba(0,0,0,0.8),
      0 0 0 1px rgba(201,148,58,0.05),
      inset 0 1px 0 rgba(201,148,58,0.15),
      0 0 60px rgba(91,184,245,0.04);
    animation: card-in .9s cubic-bezier(.22,1,.36,1) .2s both;
    position: relative; overflow: hidden;
  }
  @keyframes card-in { from{opacity:0;transform:translateY(50px) scale(0.95)} to{opacity:1;transform:translateY(0) scale(1)} }

  /* Gold top border shimmer */
  .cm-glass-card::before {
    content: '';
    position: absolute; top: 0; left: -100%; width: 60%; height: 1px;
    background: linear-gradient(90deg, transparent, var(--gold-bright), transparent);
    animation: shimmer-border 5s ease-in-out infinite;
  }
  @keyframes shimmer-border { 0%{left:-100%} 100%{left:200%} }

  /* Corner anchors */
  .cm-corner {
    position: absolute; width: 16px; height: 16px;
    opacity: 0.25;
  }
  .cm-corner-tl { top: 8px; left: 8px; border-top: 1px solid var(--gold); border-left: 1px solid var(--gold); }
  .cm-corner-tr { top: 8px; right: 8px; border-top: 1px solid var(--gold); border-right: 1px solid var(--gold); }
  .cm-corner-bl { bottom: 8px; left: 8px; border-bottom: 1px solid var(--gold); border-left: 1px solid var(--gold); }
  .cm-corner-br { bottom: 8px; right: 8px; border-bottom: 1px solid var(--gold); border-right: 1px solid var(--gold); }

  /* Logo area */
  .cm-card-logo {
    text-align: center; margin-bottom: 28px;
    animation: fade-up .6s ease .6s both;
  }
  .cm-logo-img {
    width: 100px; height: 100px; margin: 0 auto 14px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid rgba(201,148,58,0.3);
    box-shadow: 0 0 30px rgba(201,148,58,0.2), 0 8px 24px rgba(0,0,0,0.5);
    background: #06080f;
  }
  @keyframes fade-up { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  .cm-card-title {
    font-family: 'Cinzel', serif;
    font-size: 22px; font-weight: 700; letter-spacing: 2px;
    color: var(--white); line-height: 1.1;
    text-shadow: 0 2px 10px rgba(91,184,245,0.2);
  }
  .cm-card-title span { color: var(--gold-light); }
  .cm-card-sub {
    font-size: 10px; color: rgba(176,200,230,0.3); margin-top: 4px;
    letter-spacing: 2.5px; text-transform: uppercase;
    font-family: 'Share Tech Mono', monospace;
  }

  /* Gold divider */
  .cm-divider {
    display: flex; align-items: center; gap: 10px; margin-bottom: 24px;
    animation: fade-up .6s ease .65s both;
  }
  .cm-divider-line { flex: 1; height: 1px; background: linear-gradient(90deg, transparent, rgba(201,148,58,0.3), transparent); }
  .cm-divider-icon { font-size: 12px; color: var(--gold); opacity: 0.6; }

  /* Form */
  .cm-form { display: flex; flex-direction: column; gap: 14px; animation: fade-up .6s ease .7s both; }

  .cm-field { display: flex; flex-direction: column; gap: 6px; }
  .cm-label {
    font-family: 'Share Tech Mono', monospace;
    font-size: 9px; font-weight: 400; letter-spacing: 2px;
    text-transform: uppercase; color: rgba(176,200,230,0.4);
  }

  .cm-input-wrap { position: relative; }
  .cm-input-icon {
    position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
    opacity: 0.3; pointer-events: none; font-size: 13px;
    transition: opacity .2s;
  }
  .cm-input {
    width: 100%;
    background: rgba(91,184,245,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 3px;
    color: var(--white);
    font-family: 'Crimson Text', serif;
    font-size: 15px; font-weight: 400;
    padding: 13px 14px 13px 42px;
    outline: none;
    transition: all .25s;
    -webkit-text-fill-color: var(--white);
  }
  .cm-input:-webkit-autofill {
    -webkit-box-shadow: 0 0 0 100px rgba(6,14,28,0.95) inset;
    -webkit-text-fill-color: var(--white);
  }
  .cm-input::placeholder { color: rgba(176,200,230,0.2); }
  .cm-input:focus {
    border-color: rgba(201,148,58,0.4);
    background: rgba(201,148,58,0.04);
    box-shadow: 0 0 0 3px rgba(201,148,58,0.08), 0 2px 12px rgba(0,0,0,0.3);
  }
  .cm-input:focus ~ .cm-input-icon,
  .cm-input-wrap:focus-within .cm-input-icon { opacity: 0.7; }

  /* Password toggle */
  .cm-eye {
    position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
    background: none; border: none; cursor: pointer;
    color: rgba(176,200,230,0.25); font-size: 13px; padding: 4px;
    transition: color .18s;
  }
  .cm-eye:hover { color: rgba(176,200,230,0.65); }

  /* Error */
  .cm-error {
    background: rgba(248,113,113,0.08); border: 1px solid rgba(248,113,113,0.2);
    border-left: 3px solid rgba(248,113,113,0.5);
    border-radius: 3px; padding: 10px 14px;
    font-size: 12px; color: #fca5a5;
    display: flex; align-items: center; gap: 8px;
    font-family: 'Share Tech Mono', monospace;
    letter-spacing: 0.5px;
    animation: shake .4s ease;
  }
  @keyframes shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-5px)} 40%,80%{transform:translateX(5px)} }

  /* Submit button */
  .cm-submit {
    width: 100%; padding: 14px;
    background: linear-gradient(135deg, #a07828, #c9943a, #e8b84b, #c9943a);
    background-size: 200% 200%;
    border: none; border-radius: 3px;
    color: #1a0e00; font-family: 'Cinzel', serif;
    font-size: 13px; font-weight: 700; letter-spacing: 2px;
    text-transform: uppercase;
    cursor: pointer; position: relative; overflow: hidden;
    transition: all .25s;
    box-shadow: 0 6px 24px rgba(201,148,58,0.3), 0 2px 6px rgba(0,0,0,0.3);
    margin-top: 4px;
    animation: btn-gradient 4s ease infinite;
  }
  @keyframes btn-gradient { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
  .cm-submit::before {
    content: '';
    position: absolute; top: 0; left: -100%; width: 50%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
    transition: left .5s;
  }
  .cm-submit:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(201,148,58,0.45); filter: brightness(1.08); }
  .cm-submit:hover::before { left: 160%; }
  .cm-submit:active { transform: scale(0.98); }
  .cm-submit:disabled { opacity: 0.4; cursor: not-allowed; transform: none; box-shadow: none; }
  .cm-submit-inner { display: flex; align-items: center; justify-content: center; gap: 8px; }

  /* Spinner */
  .cm-spinner {
    width: 14px; height: 14px; border: 2px solid rgba(26,14,0,0.25);
    border-top-color: rgba(26,14,0,0.8); border-radius: 50%;
    animation: spin .6s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* Footer */
  .cm-footer {
    text-align: center; margin-top: 24px;
    animation: fade-up .6s ease .9s both;
    border-top: 1px solid rgba(255,255,255,0.05);
    padding-top: 18px;
  }
  .cm-footer-company {
    font-family: 'Share Tech Mono', monospace;
    font-size: 9px; color: rgba(176,200,230,0.25);
    letter-spacing: 2.5px; text-transform: uppercase;
    margin-bottom: 4px;
  }
  .cm-footer-support {
    font-family: 'Share Tech Mono', monospace;
    font-size: 9px; color: rgba(201,148,58,0.4);
    letter-spacing: 1px;
  }
  .cm-footer-support span { color: rgba(201,148,58,0.6); }
  .cm-footer-copy {
    font-size: 10px; color: rgba(176,200,230,0.12); margin-top: 5px;
    font-family: 'Share Tech Mono', monospace; letter-spacing: 1px;
  }
`;

// Stars
const STARS = Array.from({ length: 80 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 60}%`,
  size: `${1 + Math.random() * 2.5}px`,
  dur: `${2 + Math.random() * 5}s`,
  delay: `${Math.random() * 5}s`,
  opacity: 0.3 + Math.random() * 0.7,
}));

function useClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

function useNetworkStatus() {
  const [online, setOnline] = useState(navigator.onLine);
  const [ping, setPing] = useState(null);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    // Simulate ping measurement
    const measurePing = () => {
      const start = performance.now();
      fetch('https://www.google.com/favicon.ico', { mode: 'no-cors', cache: 'no-store' })
        .then(() => setPing(Math.round(performance.now() - start)))
        .catch(() => setPing(null));
    };
    measurePing();
    const interval = setInterval(measurePing, 10000);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); clearInterval(interval); };
  }, []);
  return { online, ping };
}

const WEEKDAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function pad(n) { return String(n).padStart(2,'0'); }

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const now = useClock();
  const { online, ping } = useNetworkStatus();

  const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  const dateStr = `${WEEKDAYS[now.getDay()]}, ${now.getDate()} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`;

  const pingBars = ping !== null ? Math.min(5, Math.ceil(5 - (ping / 100))) : 0;

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError("Please enter your credentials."); return; }
    setLoading(true); setError("");
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", { email, password });
      if (!res?.data?.token || !res?.data?.user?.role) throw new Error("Invalid response");
      localStorage.setItem("token", res.data.token);
      const role = String(res.data.user.role || "").toLowerCase();
      localStorage.setItem("role", role);
      // Store user details for sidebar display
      localStorage.setItem("name", res.data.user.name || "");
      localStorage.setItem("email", res.data.user.email || "");
      if (role === "admin") navigate("/admin");
      else navigate("/cashier");
    } catch (err) {
      const s = err?.response?.status;
      if (s === 400 || s === 401 || s === 404) setError("Invalid email or password.");
      else if (s === 403) setError("Account disabled. Contact admin.");
      else if (s === 503) setError(err?.response?.data?.message || "Cloud database unavailable.");
      else setError(err?.response?.data?.message || "Unable to connect. Check network.");
    } finally { setLoading(false); }
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="cm-root">

        {/* Background */}
        <div className="cm-bg" />

        {/* Stars */}
        <div className="cm-stars">
          {STARS.map(s => (
            <div key={s.id} className="cm-star" style={{
              left: s.left, top: s.top,
              width: s.size, height: s.size,
              '--base-op': s.opacity,
              animationDuration: s.dur,
              animationDelay: s.delay,
            }} />
          ))}
        </div>

        {/* Moon */}
        <div className="cm-moon" />
        <div className="cm-reflection" />

        {/* Boat SVG */}
        <div className="cm-boat">
          <svg viewBox="0 0 160 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 55 L140 55 L120 70 L40 70 Z" fill="rgba(176,200,230,0.8)" />
            <rect x="75" y="10" width="3" height="45" fill="rgba(176,200,230,0.6)" />
            <path d="M78 12 L110 35 L78 38 Z" fill="rgba(201,148,58,0.7)" />
            <path d="M75 14 L44 35 L75 38 Z" fill="rgba(201,148,58,0.5)" />
          </svg>
        </div>

        {/* Waves */}
        <div className="cm-ocean">
          <div className="cm-wave cm-wave-1" />
          <div className="cm-wave cm-wave-2" />
          <div className="cm-wave cm-wave-3" />
        </div>

        {/* Layout */}
        <div className="cm-layout">

          {/* ── LEFT ── */}
          <div className="cm-left">

            <div className="cm-rope-top">
              <div className="cm-rope-knot" />
              <div className="cm-rope-line" />
              <span className="cm-rope-tag">Est. Balapitiya, Sri Lanka</span>
            </div>

            <div className="cm-restaurant-badge">
              <span className="cm-badge-anchor">⚓</span>
              <span className="cm-badge-text">Captain's Cafe — Marina POS</span>
            </div>

            <div className="cm-headline">CAPTAIN<span className="cm-headline-apostrophe">'</span>S</div>
            <div className="cm-headline-2">Café</div>
            <p className="cm-tagline">Balapitiya Marina, Southern Coast of Sri Lanka</p>

            <p className="cm-desc">
              Where the ocean breeze meets freshly brewed flavour.
              Our point-of-sale system keeps orders swift and service seamless —
              so your crew can focus on the voyage, not the paperwork.
            </p>

            <div className="cm-stats">
              <div className="cm-stat">
                <div className="cm-stat-val">⚓</div>
                <div className="cm-stat-label">Marina View</div>
              </div>
              <div className="cm-stat">
                <div className="cm-stat-val">24/7</div>
                <div className="cm-stat-label">Service</div>
              </div>
              <div className="cm-stat">
                <div className="cm-stat-val">LKR</div>
                <div className="cm-stat-label">Currency</div>
              </div>
            </div>

            {/* System Status Panel */}
            <div className="cm-status-panel">
              <div className="cm-status-header">
                <span className="cm-status-title">⚙ System Status Console</span>
                <div className="cm-blink-dot" style={{ background: online ? '#34d399' : '#f87171', boxShadow: online ? '0 0 8px #34d399' : '0 0 8px #f87171' }} />
              </div>

              <div className="cm-status-row">
                <span className="cm-status-key">NETWORK</span>
                <span className={`cm-status-val ${online ? 'online' : 'offline'}`}>
                  {online ? '● CONNECTED' : '○ OFFLINE'}
                </span>
              </div>

              {online && ping !== null && (
                <div className="cm-status-row">
                  <span className="cm-status-key">SIGNAL</span>
                  <div className="cm-ping-bar">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className={`cm-ping-seg ${i <= pingBars ? 'active' : ''}`} style={{ height: `${6 + i*2}px`, alignSelf: 'flex-end' }} />
                    ))}
                    <span className="cm-status-val blue" style={{ marginLeft: 6, fontSize: 9 }}>{ping}ms</span>
                  </div>
                </div>
              )}

              <div className="cm-status-row">
                <span className="cm-status-key">SYSTEM</span>
                <span className="cm-status-val online">● ONLINE</span>
              </div>

              <div className="cm-status-row">
                <span className="cm-status-key">TIME</span>
                <span className="cm-status-val gold">{timeStr}</span>
              </div>

              <div className="cm-status-row" style={{ marginBottom: 0 }}>
                <span className="cm-status-key">DATE</span>
                <span className="cm-status-val blue" style={{ fontSize: 9 }}>{dateStr}</span>
              </div>
            </div>

          </div>

          {/* ── RIGHT ── */}
          <div className="cm-right">
            <div className="cm-compass" />

            <div className="cm-glass-card">
              <div className="cm-corner cm-corner-tl" />
              <div className="cm-corner cm-corner-tr" />
              <div className="cm-corner cm-corner-bl" />
              <div className="cm-corner cm-corner-br" />

              {/* Logo */}
              <div className="cm-card-logo">
                <img
                  src="https://i.ibb.co/B2Mn4HSr/captains-marina-new-logo.png"
                  alt="Captain's Marina Logo"
                  className="cm-logo-img"
                  onError={e => { e.target.style.display='none'; }}
                />
                <div className="cm-card-title">CAPTAIN<span>'</span>S CAFÉ</div>
                <div className="cm-card-sub">Marina Point-of-Sale System</div>
              </div>

              <div className="cm-divider">
                <div className="cm-divider-line" />
                <span className="cm-divider-icon">⚓</span>
                <div className="cm-divider-line" />
              </div>

              {/* Form */}
              <form onSubmit={handleLogin} className="cm-form" autoComplete="off">

                {error && (
                  <div className="cm-error">
                    <span>▲</span> {error}
                  </div>
                )}

                <div className="cm-field">
                  <label className="cm-label">Email Address</label>
                  <div className="cm-input-wrap">
                    <span className="cm-input-icon">✉</span>
                    <input
                      className="cm-input"
                      type="email"
                      placeholder="captain@marina.lk"
                      value={email}
                      onChange={e => { setEmail(e.target.value); setError(""); }}
                      autoComplete="username"
                    />
                  </div>
                </div>

                <div className="cm-field">
                  <label className="cm-label">Password</label>
                  <div className="cm-input-wrap">
                    <span className="cm-input-icon">🔒</span>
                    <input
                      className="cm-input"
                      type={showPass ? "text" : "password"}
                      placeholder="••••••••••"
                      value={password}
                      onChange={e => { setPassword(e.target.value); setError(""); }}
                      autoComplete="current-password"
                    />
                    <button type="button" className="cm-eye" onClick={() => setShowPass(p => !p)}
                      title={showPass ? "Hide" : "Show"}>
                      {showPass ? "🙈" : "👁"}
                    </button>
                  </div>
                </div>

                <button type="submit" className="cm-submit" disabled={loading}>
                  <div className="cm-submit-inner">
                    {loading
                      ? <><div className="cm-spinner" /> Setting Sail...</>
                      : <>Set Sail  ⚓</>
                    }
                  </div>
                </button>

              </form>

              {/* Footer */}
              <div className="cm-footer">
                <div className="cm-footer-company">Powered by Lexient Innovations</div>
                <div className="cm-footer-support">Support: <span>0778231121</span> (Sasindu)</div>
                <div className="cm-footer-copy">© 2025 Captain's Café POS · All rights reserved</div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </>
  );
}