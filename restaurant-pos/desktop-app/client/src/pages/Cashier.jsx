import React, { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import ThermalReceipt from "./ThermalReceipt";
import MainLayout from "../layout/MainLayout";
import ReactDOM from "react-dom/client";


// ─── Styles ───────────────────────────────────────────────────────────────────
const buildStyles = (theme, fontScale) => `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');

  :root {
    /* THEME VARS */
    --bg-base:      ${theme === "dark" ? "#0a0c12" : "#f0f2f7"};
    --bg-card:      ${theme === "dark" ? "#13161f" : "#ffffff"};
    --bg-elevated:  ${theme === "dark" ? "#1c2030" : "#e8ebf4"};
    --bg-hover:     ${theme === "dark" ? "#242840" : "#dde0ec"};
    --accent:       #f5a623;
    --accent-dim:   rgba(245,166,35,0.12);
    --accent-glow:  rgba(245,166,35,0.3);
    --success:      #22c55e;
    --success-dim:  rgba(34,197,94,0.12);
    --danger:       #ef4444;
    --danger-dim:   rgba(239,68,68,0.12);
    --info:         #3b82f6;
    --info-dim:     rgba(59,130,246,0.12);
    --purple:       #a855f7;
    --purple-dim:   rgba(168,85,247,0.12);
    --teal:         #14b8a6;
    --teal-dim:     rgba(20,184,166,0.12);
    --text-primary: ${theme === "dark" ? "#eef0f8" : "#1a1d2e"};
    --text-muted:   ${theme === "dark" ? "#64748b" : "#6b7280"};
    --text-dim:     ${theme === "dark" ? "#2d3452" : "#c5cad8"};
    --border:       ${theme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)"};
    --border-accent:rgba(245,166,35,0.25);
    --radius:       14px;
    --radius-sm:    9px;
    --font:         'Sora', sans-serif;
    --mono:         'JetBrains Mono', monospace;
    --shadow:       0 4px 24px rgba(0,0,0,0.5);
    --fs:           ${fontScale}px;
  }

  .pos-root *, .pos-root *::before, .pos-root *::after { box-sizing: border-box; margin: 0; padding: 0; }
  .pos-root { font-family: var(--font); background: var(--bg-base); color: var(--text-primary); height: 100vh; overflow: hidden; font-size: var(--fs); transition: background .3s, color .3s; }

  /* ── Layout ── */
  .pos-layout { display: flex; height: 100vh; }

  /* ── LEFT PANEL ── */
  .pos-left { flex: 1; display: flex; flex-direction: column; padding: 20px 20px 20px 24px; overflow: hidden; min-width: 0; }

  .pos-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; gap: 12px; flex-wrap: wrap; }
  .pos-logo { display: flex; align-items: center; gap: 10px; }
  .pos-logo-dot { width: 9px; height: 9px; background: var(--accent); border-radius: 50%; box-shadow: 0 0 10px var(--accent-glow); animation: pulse-dot 2s infinite; flex-shrink: 0; }
  @keyframes pulse-dot { 0%,100%{ opacity:1; transform:scale(1); } 50%{ opacity:0.5; transform:scale(1.4); } }
  .pos-logo-text { font-size: calc(var(--fs) * 1.2); font-weight: 700; letter-spacing: -0.3px; }
  .pos-logo-text span { color: var(--accent); }
  .pos-time { font-family: var(--mono); font-size: calc(var(--fs) * 0.85); color: var(--text-muted); background: var(--bg-card); padding: 5px 12px; border-radius: 20px; border: 1px solid var(--border); flex-shrink: 0; }

  .pos-header-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .pos-orders-btn { display: flex; align-items: center; gap: 6px; background: var(--bg-card); border: 1px solid var(--border); color: var(--text-muted); font-family: var(--font); font-size: calc(var(--fs) * 0.85); font-weight: 600; padding: 7px 13px; border-radius: 20px; cursor: pointer; transition: all .18s; }
  .pos-orders-btn:hover { border-color: var(--border-accent); color: var(--accent); background: var(--accent-dim); }
  .pos-orders-btn-dot { width: 7px; height: 7px; background: var(--info); border-radius: 50%; }

  /* Theme / Scale controls */
  .pos-controls { display: flex; align-items: center; gap: 8px; }
  .pos-theme-btn { width: 34px; height: 34px; border-radius: 50%; border: 1px solid var(--border); background: var(--bg-card); cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 16px; transition: all .18s; }
  .pos-theme-btn:hover { border-color: var(--border-accent); background: var(--accent-dim); }
  .pos-scale-wrap { display: flex; align-items: center; gap: 4px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 20px; padding: 3px 8px; }
  .pos-scale-btn { background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 14px; font-weight: 700; padding: 0 4px; transition: color .15s; }
  .pos-scale-btn:hover { color: var(--accent); }
  .pos-scale-val { font-family: var(--mono); font-size: 11px; color: var(--text-muted); min-width: 28px; text-align: center; }

  /* Search */
  .pos-search-wrap { position: relative; margin-bottom: 14px; }
  .pos-search-icon { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); opacity: 0.3; pointer-events: none; }
  .pos-search { width: 100%; background: var(--bg-card); border: 1px solid var(--border); color: var(--text-primary); font-family: var(--font); font-size: calc(var(--fs) * 0.93); padding: 12px 14px 12px 40px; border-radius: var(--radius); outline: none; transition: border-color .2s, box-shadow .2s; }
  .pos-search:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-dim); }
  .pos-search::placeholder { color: var(--text-muted); }

  /* Categories */
  .pos-cats { display: flex; gap: 7px; margin-bottom: 16px; flex-wrap: wrap; }
  .pos-cat { padding: 6px 14px; border-radius: 20px; border: 1px solid var(--border); background: transparent; color: var(--text-muted); font-family: var(--font); font-size: calc(var(--fs) * 0.85); font-weight: 500; cursor: pointer; transition: all .18s; white-space: nowrap; }
  .pos-cat:hover { border-color: var(--border-accent); color: var(--accent); background: var(--accent-dim); }
  .pos-cat.active { background: var(--accent); color: #0a0c12; border-color: var(--accent); font-weight: 700; box-shadow: 0 4px 12px var(--accent-glow); }

  /* Items Grid */
  .pos-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(148px, 1fr)); gap: 10px; overflow-y: auto; flex: 1; padding-right: 4px; }
  .pos-grid::-webkit-scrollbar { width: 3px; }
  .pos-grid::-webkit-scrollbar-track { background: transparent; }
  .pos-grid::-webkit-scrollbar-thumb { background: var(--text-dim); border-radius: 4px; }

  .pos-item { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px 14px; cursor: pointer; transition: all .18s; position: relative; overflow: hidden; }
  .pos-item::before { content:''; position:absolute; inset:0; background: linear-gradient(135deg, var(--accent-dim), transparent); opacity:0; transition: opacity .2s; pointer-events: none; }
  .pos-item:hover { border-color: var(--border-accent); transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.2); }
  .pos-item:hover::before { opacity:1; }
  .pos-item:active { transform: scale(0.97); }
  .pos-item-emoji { font-size: 26px; margin-bottom: 8px; display: block; }
  .pos-item-name { font-size: calc(var(--fs) * 0.85); font-weight: 600; color: var(--text-primary); margin-bottom: 4px; line-height: 1.3; }
  .pos-item-price { font-family: var(--mono); font-size: calc(var(--fs) * 0.8); color: var(--accent); font-weight: 500; }
  .pos-item-has-portion { font-size: 9px; color: var(--teal); margin-top: 3px; font-weight: 600; }
  .pos-item-add { position: absolute; top: 8px; right: 8px; width: 20px; height: 20px; background: var(--accent-dim); border-radius: 50%; display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity .18s; color: var(--accent); font-size: 13px; font-weight: 700; }
  .pos-item:hover .pos-item-add { opacity: 1; }

  /* ── RIGHT PANEL ── */
  .pos-right { width: 370px; flex-shrink: 0; display: flex; flex-direction: column; background: var(--bg-card); border-left: 1px solid var(--border); }

  .pos-right-header { padding: 20px 22px 0; }
  .pos-right-title { font-size: calc(var(--fs) * 1.2); font-weight: 700; letter-spacing: -0.3px; margin-bottom: 14px; display: flex; align-items: center; gap: 8px; }
  .pos-right-title-icon { font-size: 16px; }
  .pos-cart-count { margin-left: auto; background: var(--accent); color: #0a0c12; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 20px; font-family: var(--mono); }

  /* Customer lookup */
  .pos-customer-wrap { display: flex; gap: 7px; margin-bottom: 10px; }
  .pos-input { background: var(--bg-elevated); border: 1px solid var(--border); color: var(--text-primary); font-family: var(--font); font-size: calc(var(--fs) * 0.87); padding: 9px 12px; border-radius: var(--radius-sm); outline: none; flex: 1; transition: border-color .2s; }
  .pos-input:focus { border-color: var(--accent); }
  .pos-input::placeholder { color: var(--text-muted); }
  .pos-btn-check { background: var(--bg-elevated); border: 1px solid var(--border-accent); color: var(--accent); font-family: var(--font); font-size: calc(var(--fs) * 0.8); font-weight: 600; padding: 9px 12px; border-radius: var(--radius-sm); cursor: pointer; white-space: nowrap; transition: all .18s; }
  .pos-btn-check:hover { background: var(--accent-dim); }

  .pos-member-badge { background: var(--success-dim); border: 1px solid rgba(34,197,94,0.2); border-radius: var(--radius-sm); padding: 7px 11px; margin-bottom: 10px; display: flex; align-items: center; gap: 7px; font-size: calc(var(--fs) * 0.8); color: var(--success); font-weight: 500; }
  .pos-member-dot { width: 6px; height: 6px; background: var(--success); border-radius: 50%; flex-shrink: 0; }

  /* Payment method selector */
  .pos-pay-label { font-size: calc(var(--fs) * 0.73); font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 7px; }
  .pos-pay-methods { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-bottom: 12px; }
  .pos-pay-btn { padding: 7px 4px; border-radius: var(--radius-sm); border: 1px solid var(--border); background: var(--bg-elevated); color: var(--text-muted); font-family: var(--font); font-size: calc(var(--fs) * 0.67); font-weight: 600; cursor: pointer; text-align: center; transition: all .18s; line-height: 1.4; }
  .pos-pay-btn span { display: block; font-size: 14px; margin-bottom: 2px; }
  .pos-pay-btn:hover { border-color: rgba(255,255,255,0.15); color: var(--text-primary); }
  .pos-pay-btn.active-cash     { border-color: var(--success); color: var(--success); background: var(--success-dim); }
  .pos-pay-btn.active-card     { border-color: var(--info); color: var(--info); background: var(--info-dim); }
  .pos-pay-btn.active-travel   { border-color: var(--teal); color: var(--teal); background: var(--teal-dim); }
  .pos-pay-btn.active-bank     { border-color: var(--purple); color: var(--purple); background: var(--purple-dim); }
  .pos-pay-btn.active-unpaid   { border-color: var(--danger); color: var(--danger); background: var(--danger-dim); }
  .pos-pay-btn.active-other    { border-color: var(--accent); color: var(--accent); background: var(--accent-dim); }

  /* Cart items */
  .pos-cart-scroll { flex: 1; overflow-y: auto; padding: 0 22px; }
  .pos-cart-scroll::-webkit-scrollbar { width: 3px; }
  .pos-cart-scroll::-webkit-scrollbar-thumb { background: var(--text-dim); border-radius: 4px; }

  .pos-cart-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: var(--text-muted); font-size: calc(var(--fs) * 0.87); gap: 6px; }
  .pos-cart-empty-icon { font-size: 36px; opacity: 0.25; }

  .pos-cart-item { display: flex; align-items: center; gap: 8px; padding: 10px 0; border-bottom: 1px solid var(--border); animation: slide-in .2s ease; cursor: grab; position: relative; }
  .pos-cart-item.dragging { opacity: 0.4; cursor: grabbing; }
  .pos-cart-item.drag-over { border-top: 2px solid var(--accent); }
  @keyframes slide-in { from { opacity:0; transform: translateX(8px); } to { opacity:1; transform: translateX(0); } }
  .pos-cart-item-drag { color: var(--text-dim); font-size: 14px; cursor: grab; padding: 0 2px; flex-shrink: 0; user-select: none; }
  .pos-cart-item-info { flex: 1; min-width: 0; }
  .pos-cart-item-name { font-size: calc(var(--fs) * 0.8); font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .pos-cart-item-portion { font-size: calc(var(--fs) * 0.73); color: var(--teal); font-weight: 500; margin-top: 1px; }
  .pos-cart-item-sub { font-family: var(--mono); font-size: calc(var(--fs) * 0.73); color: var(--accent); margin-top: 2px; }
  .pos-qty-ctrl { display: flex; align-items: center; gap: 5px; }
  .pos-qty-btn { width: 24px; height: 24px; border-radius: 6px; border: 1px solid var(--border); background: var(--bg-elevated); color: var(--text-primary); font-size: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all .15s; }
  .pos-qty-btn:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-dim); }
  .pos-qty { font-family: var(--mono); font-size: calc(var(--fs) * 0.87); font-weight: 700; min-width: 20px; text-align: center; }

  /* Footer */
  .pos-footer { padding: 14px 22px 20px; border-top: 1px solid var(--border); }
  .pos-totals { margin-bottom: 14px; }
  .pos-total-row { display: flex; justify-content: space-between; align-items: center; font-size: calc(var(--fs) * 0.8); color: var(--text-muted); margin-bottom: 5px; }
  .pos-total-row.grand { font-size: calc(var(--fs) * 1.33); font-weight: 700; color: var(--text-primary); font-family: var(--mono); margin-top: 8px; }
  .pos-total-row.grand .label { font-family: var(--font); font-size: calc(var(--fs) * 0.8); font-weight: 500; color: var(--text-muted); }
  .pos-discount-row { color: var(--success); }

  .pos-checkout-btn { width: 100%; background: var(--accent); color: #0a0c12; font-family: var(--font); font-size: calc(var(--fs) * 0.93); font-weight: 700; padding: 14px; border-radius: var(--radius); border: none; cursor: pointer; letter-spacing: 0.3px; transition: all .2s; box-shadow: 0 6px 18px var(--accent-glow); display: flex; align-items: center; justify-content: center; gap: 8px; }
  .pos-checkout-btn:hover { transform: translateY(-1px); box-shadow: 0 10px 24px var(--accent-glow); filter: brightness(1.08); }
  .pos-checkout-btn:active { transform: scale(0.98); }
  .pos-checkout-btn:disabled { opacity: 0.35; cursor: not-allowed; transform: none; box-shadow: none; }
  .pos-checkout-btn.unpaid-mode { background: var(--danger); box-shadow: 0 6px 18px rgba(239,68,68,0.3); color: #fff; }

  /* ── MODALS ── */
  .pos-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 100; animation: fade-in .2s ease; }
  @keyframes fade-in { from { opacity:0; } to { opacity:1; } }

  .pos-modal { background: var(--bg-card); border: 1px solid var(--border-accent); border-radius: 20px; width: 480px; max-height: 92vh; display: flex; flex-direction: column; animation: pop-in .25s cubic-bezier(.34,1.56,.64,1); box-shadow: 0 30px 80px rgba(0,0,0,0.7), 0 0 0 1px var(--border-accent); overflow: hidden; }
  .pos-modal.wide { width: 560px; }
  @keyframes pop-in { from { opacity:0; transform:scale(0.88) translateY(16px); } to { opacity:1; transform:scale(1) translateY(0); } }

  .pos-modal-header { padding: 24px 28px 20px; border-bottom: 1px solid var(--border); flex-shrink: 0; display: flex; align-items: center; gap: 12px; }
  .pos-modal-icon { font-size: 28px; }
  .pos-modal-title { font-size: calc(var(--fs) * 1.2); font-weight: 700; }
  .pos-modal-sub { font-size: calc(var(--fs) * 0.8); color: var(--text-muted); margin-top: 2px; }
  .pos-modal-close { margin-left: auto; width: 32px; height: 32px; border-radius: 8px; border: 1px solid var(--border); background: transparent; color: var(--text-muted); cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 18px; transition: all .15s; }
  .pos-modal-close:hover { color: var(--text-primary); border-color: rgba(255,255,255,0.15); background: var(--bg-elevated); }
  .pos-modal-body { flex: 1; overflow-y: auto; padding: 20px 28px; }
  .pos-modal-body::-webkit-scrollbar { width: 3px; }
  .pos-modal-body::-webkit-scrollbar-thumb { background: var(--text-dim); border-radius: 4px; }
  .pos-modal-footer { padding: 16px 28px 24px; border-top: 1px solid var(--border); flex-shrink: 0; display: flex; gap: 10px; }

  /* Portion selector modal */
  .pos-portion-options { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 16px; }
  .pos-portion-card { background: var(--bg-elevated); border: 2px solid var(--border); border-radius: var(--radius); padding: 20px 16px; text-align: center; cursor: pointer; transition: all .2s; }
  .pos-portion-card:hover { border-color: var(--accent); background: var(--accent-dim); transform: translateY(-2px); }
  .pos-portion-card.selected { border-color: var(--accent); background: var(--accent-dim); }
  .pos-portion-card-icon { font-size: 32px; margin-bottom: 8px; }
  .pos-portion-card-label { font-size: calc(var(--fs) * 0.93); font-weight: 700; color: var(--text-primary); margin-bottom: 4px; }
  .pos-portion-card-price { font-family: var(--mono); font-size: calc(var(--fs) * 1.07); color: var(--accent); font-weight: 700; }

  /* Receipt */
  .pos-receipt-header { text-align: center; margin-bottom: 20px; }
  .pos-receipt-icon { font-size: 40px; margin-bottom: 6px; }
  .pos-receipt-title { font-size: calc(var(--fs) * 1.33); font-weight: 700; }
  .pos-receipt-inv { font-family: var(--mono); font-size: calc(var(--fs) * 0.73); color: var(--accent); margin-top: 4px; letter-spacing: 1px; }
  .pos-receipt-date { font-size: calc(var(--fs) * 0.73); color: var(--text-muted); margin-top: 2px; }
  .pos-receipt-pay-method { display: inline-flex; align-items: center; gap: 5px; font-size: calc(var(--fs) * 0.73); font-weight: 600; padding: 3px 10px; border-radius: 20px; margin-top: 8px; }
  .pos-receipt-divider { height: 1px; background: var(--border); margin: 14px 0; }
  .pos-receipt-item { display: flex; justify-content: space-between; align-items: center; padding: 5px 0; font-size: calc(var(--fs) * 0.87); }
  .pos-receipt-item span:first-child { color: var(--text-muted); }
  .pos-receipt-item span:last-child { font-family: var(--mono); font-weight: 600; }
  .pos-receipt-total-row { display: flex; justify-content: space-between; align-items: center; }
  .pos-receipt-grand { font-size: calc(var(--fs) * 1.47); font-weight: 700; color: var(--accent); font-family: var(--mono); }
  .pos-receipt-grand-label { font-size: calc(var(--fs) * 0.8); color: var(--text-muted); }
  .pos-receipt-subtotal { font-size: calc(var(--fs) * 0.8); color: var(--text-muted); font-family: var(--mono); }
  .pos-receipt-discount { font-size: calc(var(--fs) * 0.8); color: var(--success); font-family: var(--mono); }

  /* Register form */
  .pos-register-form { display: flex; flex-direction: column; gap: 12px; }
  .pos-register-field { display: flex; flex-direction: column; gap: 5px; }
  .pos-register-label { font-size: calc(var(--fs) * 0.8); font-weight: 600; color: var(--text-muted); }
  .pos-register-input { background: var(--bg-elevated); border: 1px solid var(--border); color: var(--text-primary); font-family: var(--font); font-size: calc(var(--fs) * 0.87); padding: 10px 14px; border-radius: var(--radius-sm); outline: none; transition: border-color .2s; }
  .pos-register-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-dim); }

  /* Orders */
  .pos-order-card { background: var(--bg-elevated); border: 1px solid var(--border); border-radius: var(--radius); padding: 14px 16px; margin-bottom: 10px; cursor: pointer; transition: all .18s; }
  .pos-order-card:hover { border-color: var(--border-accent); transform: translateY(-1px); }
  .pos-order-card-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
  .pos-order-inv { font-family: var(--mono); font-size: calc(var(--fs) * 0.8); color: var(--accent); font-weight: 600; }
  .pos-order-total { font-family: var(--mono); font-size: calc(var(--fs) * 0.93); font-weight: 700; }
  .pos-order-date { font-size: calc(var(--fs) * 0.73); color: var(--text-muted); }
  .pos-order-tags { display: flex; align-items: center; gap: 6px; margin-top: 6px; flex-wrap: wrap; }
  .pos-order-tag { font-size: calc(var(--fs) * 0.67); font-weight: 600; padding: 2px 8px; border-radius: 20px; }
  .pos-tag-cash    { background: var(--success-dim); color: var(--success); }
  .pos-tag-card    { background: var(--info-dim); color: var(--info); }
  .pos-tag-travel  { background: var(--teal-dim); color: var(--teal); }
  .pos-tag-bank    { background: var(--purple-dim); color: var(--purple); }
  .pos-tag-unpaid  { background: var(--danger-dim); color: var(--danger); }
  .pos-tag-other   { background: var(--accent-dim); color: var(--accent); }
  .pos-tag-items   { background: rgba(255,255,255,0.06); color: var(--text-muted); }
  .pos-order-search { width: 100%; background: var(--bg-elevated); border: 1px solid var(--border); color: var(--text-primary); font-family: var(--font); font-size: calc(var(--fs) * 0.87); padding: 10px 14px; border-radius: var(--radius-sm); outline: none; margin-bottom: 14px; transition: border-color .2s; }
  .pos-order-search:focus { border-color: var(--accent); }
  .pos-order-search::placeholder { color: var(--text-muted); }

  /* Modal buttons */
  .pos-modal-btn { flex: 1; padding: 12px; border-radius: var(--radius-sm); border: none; font-family: var(--font); font-size: calc(var(--fs) * 0.87); font-weight: 600; cursor: pointer; transition: all .18s; }
  .pos-modal-btn.primary { background: var(--accent); color: #0a0c12; box-shadow: 0 4px 12px var(--accent-glow); }
  .pos-modal-btn.primary:hover { filter: brightness(1.1); }
  .pos-modal-btn.primary:disabled { opacity: 0.4; cursor: not-allowed; }
  .pos-modal-btn.secondary { background: var(--bg-elevated); color: var(--text-muted); border: 1px solid var(--border); }
  .pos-modal-btn.secondary:hover { color: var(--text-primary); border-color: rgba(255,255,255,0.15); }
  .pos-modal-btn.danger { background: var(--danger-dim); color: var(--danger); border: 1px solid rgba(239,68,68,0.3); }

  /* Info banner */
  .pos-info-banner { background: var(--danger-dim); border: 1px solid rgba(239,68,68,0.2); border-radius: var(--radius-sm); padding: 10px 14px; font-size: calc(var(--fs) * 0.8); color: var(--danger); }
  .pos-warn-banner { background: var(--accent-dim); border: 1px solid var(--border-accent); border-radius: var(--radius-sm); padding: 10px 14px; font-size: calc(var(--fs) * 0.8); color: var(--accent); margin-bottom: 14px; }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const catEmoji = (cat) => {
  const map = { Drinks:"🥤", Burgers:"🍔", Pizza:"🍕", Desserts:"🍰", Rice:"🍚", Noodles:"🍜", Salads:"🥗", Snacks:"🍟", All:"✦" };
  return map[cat] || "🍽️";
};
const itemEmoji = (name) => {
  const n = (name||"").toLowerCase();
  if(n.includes("coffee")||n.includes("latte")||n.includes("cappuccino")) return "☕";
  if(n.includes("tea")) return "🍵";
  if(n.includes("juice")||n.includes("lemon")) return "🍹";
  if(n.includes("burger")||n.includes("beef")) return "🍔";
  if(n.includes("pizza")) return "🍕";
  if(n.includes("cake")||n.includes("dessert")) return "🎂";
  if(n.includes("rice")) return "🍚";
  if(n.includes("pasta")||n.includes("noodle")) return "🍝";
  if(n.includes("salad")) return "🥗";
  if(n.includes("chicken")) return "🍗";
  if(n.includes("fish")||n.includes("sea")) return "🐟";
  if(n.includes("soup")) return "🍲";
  return "🍽️";
};

const PAYMENT_METHODS = [
  { key: "Cash",           label: "Cash",        icon: "💵", activeClass: "active-cash" },
  { key: "Card",           label: "Card",         icon: "💳", activeClass: "active-card" },
  { key: "Travel Package", label: "Travel Pkg",   icon: "✈️", activeClass: "active-travel" },
  { key: "Bank Transfer",  label: "Bank Transfer",icon: "🏦", activeClass: "active-bank" },
  { key: "Unpaid",         label: "Not Paid",     icon: "⏳", activeClass: "active-unpaid" },
];

const payTagClass = (m) => {
  const map = { "Cash":"cash","Card":"card","Travel Package":"travel","Bank Transfer":"bank","Unpaid":"unpaid" };
  return `pos-tag-${map[m]||"other"}`;
};
const payMethodIcon = (m) => (PAYMENT_METHODS.find(p => p.key === m)||{icon:"💰"}).icon;

function Clock({ fs }) {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const t = setInterval(()=>setTime(new Date()),1000); return()=>clearInterval(t); }, []);
  return <span className="pos-time">{time.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit",second:"2-digit"})}</span>;
}

// ─── Print Receipt ────────────────────────────────────────────────────────────
function printOrderReceipt(order) {
  const printWindow = window.open("", "", "width=400,height=600");

  // Get existing styles from current document
  const styles = Array.from(document.styleSheets)
    .map(styleSheet => {
      try {
        return Array.from(styleSheet.cssRules)
          .map(rule => rule.cssText)
          .join("");
      } catch {
        return "";
      }
    })
    .join("");

  printWindow.document.write(`
    <html>
      <head>
        <title>Receipt</title>
        <style>
          ${styles}

          @page {
            size: 80mm auto;
            margin: 0;
          }

          body {
            margin: 0;
            padding: 0;
            background: white;
            display: flex;
            justify-content: center;
          }

          #print-root {
            width: 80mm;
          }
        </style>
      </head>
      <body>
        <div id="print-root"></div>
      </body>
    </html>
  `);

  printWindow.document.close();

  const root = ReactDOM.createRoot(
    printWindow.document.getElementById("print-root")
  );

  root.render(
    <ThermalReceipt
      order={{
        ...order,
        subTotal: order.subtotal ?? order.subTotal,
        totalDiscount: order.discountAmount ?? order.totalDiscount
      }}
      customer={
        order.customerPhone
          ? { name: order.customerPhone }
          : null
      }
    />
  );

  // Wait for images + render
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }, 500);
  };
}

// ─── Portion Selector Modal ───────────────────────────────────────────────────
function PortionModal({ item, onSelect, onClose }) {
  const hasSmall = item.portion?.smallPrice != null;
  return (
    <div className="pos-overlay" style={{zIndex:200}}>
      <div className="pos-modal">
        <div className="pos-modal-header">
          <div className="pos-modal-icon">{itemEmoji(item.name)}</div>
          <div>
            <div className="pos-modal-title">{item.name}</div>
            <div className="pos-modal-sub">Select portion size</div>
          </div>
          <button className="pos-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="pos-modal-body">
          <div className="pos-portion-options">
            <div className="pos-portion-card" onClick={() => onSelect("Full", item.portion?.fullPrice)}>
              <div className="pos-portion-card-icon">🍽️</div>
              <div className="pos-portion-card-label">Full Portion</div>
              <div className="pos-portion-card-price">Rs. {item.portion?.fullPrice ?? item.price ?? 0}</div>
            </div>
            {hasSmall && (
              <div className="pos-portion-card" onClick={() => onSelect("Half", item.portion.smallPrice)}>
                <div className="pos-portion-card-icon">🥣</div>
                <div className="pos-portion-card-label">Half Portion</div>
                <div className="pos-portion-card-price">Rs. {item.portion.smallPrice}</div>
              </div>
            )}
          </div>
        </div>
        <div className="pos-modal-footer">
          <button className="pos-modal-btn secondary" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ─── Register Customer Modal ──────────────────────────────────────────────────
function RegisterCustomerModal({ phone, token, onRegistered, onClose }) {
  const [form, setForm] = useState({ name: "", phone: phone || "", email: "", discountPercentage: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.phone.trim()) { setError("Name and phone are required."); return; }
    setLoading(true); setError("");
    try {
      const res = await axios.post("http://localhost:5000/api/customers", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onRegistered(res.data);
    } catch (e) {
      setError(e.response?.data?.message || "Registration failed. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="pos-overlay" style={{zIndex:200}}>
      <div className="pos-modal">
        <div className="pos-modal-header">
          <div className="pos-modal-icon">👤</div>
          <div>
            <div className="pos-modal-title">Register Customer</div>
            <div className="pos-modal-sub">New customer not found in database</div>
          </div>
          <button className="pos-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="pos-modal-body">
          <div className="pos-warn-banner">
            📱 No customer found for <strong>{phone}</strong>. Fill in details to register.
          </div>
          {error && <div className="pos-info-banner" style={{marginBottom:12}}>{error}</div>}
          <div className="pos-register-form">
            <div className="pos-register-field">
              <label className="pos-register-label">Full Name *</label>
              <input className="pos-register-input" placeholder="John Doe" value={form.name}
                onChange={e => setForm(p=>({...p,name:e.target.value}))} />
            </div>
            <div className="pos-register-field">
              <label className="pos-register-label">Phone *</label>
              <input className="pos-register-input" placeholder="07XXXXXXXX" value={form.phone}
                onChange={e => setForm(p=>({...p,phone:e.target.value}))} />
            </div>
            <div className="pos-register-field">
              <label className="pos-register-label">Email (optional)</label>
              <input className="pos-register-input" placeholder="john@example.com" value={form.email}
                onChange={e => setForm(p=>({...p,email:e.target.value}))} />
            </div>
            <div className="pos-register-field">
              <label className="pos-register-label">Member Discount %</label>
              <input className="pos-register-input" type="number" min="0" max="100" placeholder="0"
                value={form.discountPercentage}
                onChange={e => setForm(p=>({...p,discountPercentage:Number(e.target.value)}))} />
            </div>
          </div>
        </div>
        <div className="pos-modal-footer">
          <button className="pos-modal-btn primary" onClick={handleSubmit} disabled={loading}>
            {loading ? "Registering..." : "✅ Register Customer"}
          </button>
          <button className="pos-modal-btn secondary" onClick={onClose}>Skip</button>
        </div>
      </div>
    </div>
  );
}

// ─── Previous Orders Modal ────────────────────────────────────────────────────
function PreviousOrdersModal({ token, onClose }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/orders", { headers:{Authorization:`Bearer ${token}`} });
        setOrders(res.data);
      } catch { setOrders([]); }
      setLoading(false);
    })();
  }, []);

  const filtered = orders.filter(o => {
    const q = search.toLowerCase();
    return !q || (o.invoiceNumber||"").toLowerCase().includes(q) || (o.customerPhone||"").includes(q) ||
      (o.paymentMethod||"").toLowerCase().includes(q) || String(o.grandTotal).includes(q);
  });

  if (selected) return (
    <div className="pos-overlay">
      <div className="pos-modal">
        <div className="pos-modal-header">
          <div className="pos-modal-icon">🧾</div>
          <div>
            <div className="pos-modal-title">Order Receipt</div>
            <div className="pos-modal-sub">#{selected.invoiceNumber} · {new Date(selected.createdAt).toLocaleString()}</div>
          </div>
          <button className="pos-modal-close" onClick={()=>setSelected(null)}>×</button>
        </div>
        <div className="pos-modal-body">
          <div className="pos-receipt-header">
            <div className="pos-receipt-icon">🧾</div>
            <div className="pos-receipt-title">Order Complete</div>
            <div className="pos-receipt-inv">#{selected.invoiceNumber}</div>
            <div className="pos-receipt-date">{new Date(selected.createdAt).toLocaleString()}</div>
            <div className="pos-receipt-pay-method" style={{background:"var(--accent-dim)",color:"var(--accent)"}}>
              {payMethodIcon(selected.paymentMethod)} {selected.paymentMethod||"Cash"}
            </div>
          </div>
          <div className="pos-receipt-divider"/>
          {(selected.items||[]).map((item,i)=>(
            <div key={i} className="pos-receipt-item">
              <span>{item.name}{item.portion?` (${item.portion})`:""} × {item.quantity}</span>
              <span>Rs. {item.total??(item.price*item.quantity)}</span>
            </div>
          ))}
          <div className="pos-receipt-divider"/>
          {selected.discountAmount>0 && <>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
              <span className="pos-receipt-subtotal">Subtotal</span>
              <span className="pos-receipt-subtotal">Rs. {selected.subtotal}</span>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
              <span className="pos-receipt-discount">Discount</span>
              <span className="pos-receipt-discount">− Rs. {selected.discountAmount}</span>
            </div>
          </>}
          <div className="pos-receipt-total-row">
            <span className="pos-receipt-grand-label">Grand Total</span>
            <span className="pos-receipt-grand">Rs. {selected.grandTotal}</span>
          </div>
          {selected.customerPhone && <div style={{marginTop:12,fontSize:12,color:"var(--text-muted)"}}>📱 {selected.customerPhone}</div>}
        </div>
        <div className="pos-modal-footer">
          <button className="pos-modal-btn primary" onClick={()=>printOrderReceipt(selected)}>🖨️ Print</button>
          <button className="pos-modal-btn secondary" onClick={()=>setSelected(null)}>← Back</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="pos-overlay">
      <div className="pos-modal">
        <div className="pos-modal-header">
          <div className="pos-modal-icon">📋</div>
          <div>
            <div className="pos-modal-title">Previous Orders</div>
            <div className="pos-modal-sub">{orders.length} orders found</div>
          </div>
          <button className="pos-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="pos-modal-body">
          <input className="pos-order-search" placeholder="🔍 Search by invoice, phone, method..." value={search} onChange={e=>setSearch(e.target.value)} />
          {loading ? (
            <div style={{textAlign:"center",padding:"40px 0",color:"var(--text-muted)"}}>Loading orders...</div>
          ) : filtered.length===0 ? (
            <div style={{textAlign:"center",padding:"40px 0",color:"var(--text-muted)"}}>No orders found</div>
          ) : filtered.map((order,i)=>(
            <div key={i} className="pos-order-card" onClick={()=>setSelected(order)}>
              <div className="pos-order-card-top">
                <span className="pos-order-inv">#{order.invoiceNumber||"N/A"}</span>
                <span className="pos-order-total">Rs. {order.grandTotal}</span>
              </div>
              <div className="pos-order-date">{new Date(order.createdAt).toLocaleString()}</div>
              <div className="pos-order-tags">
                <span className={`pos-order-tag ${payTagClass(order.paymentMethod)}`}>{payMethodIcon(order.paymentMethod)} {order.paymentMethod||"Cash"}</span>
                <span className="pos-order-tag pos-tag-items">{order.items?.length||0} items</span>
                {order.customerPhone&&<span className="pos-order-tag pos-tag-items">📱 {order.customerPhone}</span>}
              </div>
            </div>
          ))}
        </div>
        <div className="pos-modal-footer">
          <button className="pos-modal-btn secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ─── Checkout Modal ───────────────────────────────────────────────────────────
function CheckoutModal({ cart, subtotal, discountAmt, customer, paymentMethod, setPaymentMethod, onConfirm, onClose }) {
  const total = subtotal - discountAmt;
  return (
    <div className="pos-overlay">
      <div className="pos-modal">
        <div className="pos-modal-header">
          <div className="pos-modal-icon">⚡</div>
          <div>
            <div className="pos-modal-title">Confirm Checkout</div>
            <div className="pos-modal-sub">{cart.reduce((s,i)=>s+i.quantity,0)} items · Rs. {total.toLocaleString()}</div>
          </div>
          <button className="pos-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="pos-modal-body">
          <div style={{marginBottom:18}}>
            {cart.map((item,i)=>(
              <div key={i} className="pos-receipt-item">
                <span>{item.name}{item.portion?` (${item.portion})`:""} × {item.quantity}</span>
                <span>Rs. {(item.price*item.quantity).toLocaleString()}</span>
              </div>
            ))}
            <div className="pos-receipt-divider"/>
            {discountAmt>0 && <>
              <div className="pos-receipt-item"><span>Subtotal</span><span>Rs. {subtotal.toLocaleString()}</span></div>
              <div className="pos-receipt-item" style={{color:"var(--success)"}}><span>Discount ({customer?.discountPercentage}%)</span><span>− Rs. {discountAmt.toLocaleString()}</span></div>
            </>}
            <div className="pos-receipt-total-row" style={{marginTop:4}}>
              <span className="pos-receipt-grand-label">Total</span>
              <span className="pos-receipt-grand">Rs. {total.toLocaleString()}</span>
            </div>
          </div>
          <div className="pos-pay-label">Select Payment Method</div>
          <div className="pos-pay-methods">
            {PAYMENT_METHODS.map(m=>(
              <button key={m.key} className={`pos-pay-btn ${paymentMethod===m.key?m.activeClass:""}`} onClick={()=>setPaymentMethod(m.key)}>
                <span>{m.icon}</span>{m.label}
              </button>
            ))}
          </div>
          {paymentMethod==="Unpaid" && (
            <div className="pos-info-banner">⚠️ This order will be marked as unpaid. Make sure to collect payment later.</div>
          )}
        </div>
        <div className="pos-modal-footer">
          <button
            className={`pos-modal-btn primary`}
            style={paymentMethod==="Unpaid"?{background:"var(--danger)",color:"#fff",boxShadow:"0 4px 12px rgba(239,68,68,0.3)"}:{}}
            onClick={onConfirm}
          >
            {paymentMethod==="Unpaid" ? "⏳ Save as Unpaid" : "✅ Confirm & Checkout"}
          </button>
          <button className="pos-modal-btn secondary" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ─── Receipt Modal ────────────────────────────────────────────────────────────
function ReceiptModal({ order, customer, onClose }) {
  return (
    <div className="pos-overlay">
      <div className="pos-modal wide">
        <div className="pos-modal-header">
          <div className="pos-modal-icon">✅</div>
          <div>
            <div className="pos-modal-title">Order Complete!</div>
            <div className="pos-modal-sub">#{order.invoiceNumber}</div>
          </div>
          <button className="pos-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="pos-modal-body">
          <ThermalReceipt order={order} customer={customer} />
        </div>
        <div className="pos-modal-footer">
          <button className="pos-modal-btn primary" onClick={() => printOrderReceipt(order)}>🖨️ Print Receipt</button>
          <button className="pos-modal-btn secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Cashier Component ───────────────────────────────────────────────────
export default function Cashier() {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [lastOrder, setLastOrder] = useState(null);
  const [phone, setPhone] = useState("");
  const [customer, setCustomer] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [portionItem, setPortionItem] = useState(null);      // item awaiting portion selection
  const [registerPhone, setRegisterPhone] = useState(null);  // phone for new customer registration
  const [theme, setTheme] = useState(() => localStorage.getItem("pos_theme") || "dark");
  const [fontScale, setFontScale] = useState(() => Number(localStorage.getItem("pos_fs")) || 14);

  // Drag state for cart reordering
  const dragIdx = useRef(null);

  const token = localStorage.getItem("token");
  const headers = { Authorization:`Bearer ${token}` };

  useEffect(() => { fetchItems(); }, []);
  useEffect(() => { filterItems(); }, [category, search, items]);
  useEffect(() => { localStorage.setItem("pos_theme", theme); }, [theme]);
  useEffect(() => { localStorage.setItem("pos_fs", fontScale); }, [fontScale]);

  const fetchItems = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/items", { headers:{Authorization:`Bearer ${token}`} });
      const available = res.data.filter(i => i.available !== false);
      setItems(available);
      setFilteredItems(available);
    } catch { console.error("Failed to fetch items"); }
  };

  const filterItems = () => {
    let data = items;
    if (category !== "All") data = data.filter(i => i.category === category);
    if (search) data = data.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));
    setFilteredItems(data);
  };

  const categories = ["All", ...new Set(items.map(i => i.category))];

  // Handle item click — if it has a small portion, show selector
  const handleItemClick = (item) => {
    if (item.portion?.smallPrice != null) {
      setPortionItem(item);
    } else {
      addToCart(item, "Full", item.portion?.fullPrice ?? item.price ?? 0);
    }
  };

  const addToCart = (item, portion, price) => {
    const key = `${item._id}_${portion}`;
    setCart(prev => {
      const ex = prev.find(c => c.key === key);
      if (ex) return prev.map(c => c.key===key ? {...c, quantity:c.quantity+1} : c);
      return [...prev, { key, itemId:item._id, name:item.name, portion, price, quantity:1 }];
    });
  };

  const updateQuantity = (key, type) => {
    setCart(prev =>
      prev.map(i => i.key===key ? {...i, quantity: type==="inc" ? i.quantity+1 : i.quantity-1} : i)
          .filter(i => i.quantity > 0)
    );
  };

  const clearCart = () => { setCart([]); setCustomer(null); setPhone(""); setPaymentMethod("Cash"); };

  const subtotal = cart.reduce((s,i) => s + i.price*i.quantity, 0);
  const discountAmt = customer ? Math.round((subtotal * customer.discountPercentage) / 100) : 0;
  const getTotal = () => subtotal - discountAmt;

  const buildOrderPayload = (includeFinancials = false) => {
    const payload = {
      items: cart.map(i => ({
        itemId: i.itemId,
        name: i.name,
        quantity: i.quantity,
        price: i.price,
        portion: i.portion,
        discount: 0,
        total: i.price * i.quantity,
      })),
      paymentMethod,
      customerPhone: phone || null,
    };

    if (includeFinancials) {
      payload.invoiceNumber = `OFF-${Date.now()}`;
      payload.subTotal = subtotal;
      payload.totalDiscount = discountAmt;
      payload.grandTotal = getTotal();
      payload.status = paymentMethod === "Unpaid" ? "Pending" : "Completed";
    }

    return payload;
  };

  const syncOfflineOrders = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/offline/sync",
        {},
        { headers }
      );
    } catch {
      // Silent: sync will retry next online event or next successful checkout.
    }
  };

  useEffect(() => {
    const onOnline = () => { syncOfflineOrders(); };
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, []);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    const payload = buildOrderPayload(true);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/orders",
        payload,
        { headers }
      );

      const queuedByServer = Boolean(res?.data?.offlineQueued || res?.status === 202);
      const queuedByClientInterceptor = Boolean(res?.request?.offline || res?.data?.offlineQueued);
      const treatedAsOffline = queuedByServer || queuedByClientInterceptor;

      if (treatedAsOffline) {
        const queuedOrder = res?.data?.order || {
          ...payload,
          createdAt: new Date().toISOString(),
          offlineQueued: true,
        };
        setLastOrder(queuedOrder);
        setShowCheckoutModal(false);
        clearCart();
        alert(res?.data?.message || "Internet unavailable. Order saved locally and will sync automatically.");
        return;
      }

      setLastOrder(res.data);
      setShowCheckoutModal(false);
      clearCart();
      syncOfflineOrders();
    } catch (e) {
      const responseMessage = String(e?.response?.data?.message || "").toLowerCase();
      const isNetworkOrOffline =
        !e.response ||
        e.code === "ERR_NETWORK" ||
        (typeof e.message === "string" && e.message.toLowerCase().includes("network")) ||
        e?.response?.status >= 500 ||
        responseMessage.includes("cloud") ||
        responseMessage.includes("not connected") ||
        responseMessage.includes("buffering timed out");

      if (!isNetworkOrOffline) {
        alert(e.response?.data?.message || "Checkout failed. Please try again.");
        return;
      }

      try {
        const localPayload = buildOrderPayload(true);
        await axios.post(
          "http://localhost:5000/api/offline/queue-order",
          payload,
          { headers }
        );
        setLastOrder({
          ...payload,
          createdAt: new Date().toISOString(),
          offlineQueued: true,
        });
        setShowCheckoutModal(false);
        clearCart();
        alert("Internet unavailable. Order saved locally and will sync automatically.");
      } catch {
        alert("Checkout failed and local save also failed. Please try again.");
      }
    }
  };

  const checkCustomer = async () => {
    if (!phone) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/customers/${phone}`, { headers });
      setCustomer(res.data);
    } catch {
      // Not found → offer registration
      setRegisterPhone(phone);
    }
  };

  // ── Cart drag reorder ──────────────────────────────────────────────────────
  const handleDragStart = (idx) => { dragIdx.current = idx; };
  const handleDragOver = (e, idx) => {
    e.preventDefault();
    if (dragIdx.current === null || dragIdx.current === idx) return;
    setCart(prev => {
      const next = [...prev];
      const [moved] = next.splice(dragIdx.current, 1);
      next.splice(idx, 0, moved);
      dragIdx.current = idx;
      return next;
    });
  };
  const handleDragEnd = () => { dragIdx.current = null; };

  // ── Font scale ─────────────────────────────────────────────────────────────
  const adjustFont = (delta) => setFontScale(prev => Math.min(25, Math.max(11, prev + delta)));

  return (
    <MainLayout>
      <style>{buildStyles(theme, fontScale)}</style>
      <div className="pos-root">

        {/* ── MODALS ── */}
        {showOrdersModal && <PreviousOrdersModal token={token} onClose={()=>setShowOrdersModal(false)} />}

        {portionItem && (
          <PortionModal
            item={portionItem}
            onSelect={(portion, price) => { addToCart(portionItem, portion, price); setPortionItem(null); }}
            onClose={() => setPortionItem(null)}
          />
        )}

        {registerPhone && (
          <RegisterCustomerModal
            phone={registerPhone}
            token={token}
            onRegistered={(c) => { setCustomer(c); setRegisterPhone(null); }}
            onClose={() => setRegisterPhone(null)}
          />
        )}

        {showCheckoutModal && (
          <CheckoutModal
            cart={cart} subtotal={subtotal} discountAmt={discountAmt} customer={customer}
            paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod}
            onConfirm={handleCheckout} onClose={()=>setShowCheckoutModal(false)}
          />
        )}

        {lastOrder && <ReceiptModal order={lastOrder} customer={customer} onClose={()=>setLastOrder(null)} />}

        <div className="pos-layout">

          {/* ── LEFT PANEL ── */}
          <div className="pos-left">

            {/* Header */}
            <div className="pos-header">
              <div className="pos-logo">
                <div className="pos-logo-dot" />
                <div className="pos-logo-text">Quick<span>POS</span> By Lexient Innovations</div>
              </div>
              <div className="pos-header-actions">
                <button className="pos-orders-btn" onClick={()=>setShowOrdersModal(true)}>
                  <div className="pos-orders-btn-dot" />
                  Previous Orders
                </button>

                {/* Theme toggle */}
                <div className="pos-controls">
                  <button className="pos-theme-btn" title="Toggle theme" onClick={()=>setTheme(t=>t==="dark"?"light":"dark")}>
                    {theme==="dark" ? "☀️" : "🌙"}
                  </button>
                  <div className="pos-scale-wrap" title="Font size">
                    <button className="pos-scale-btn" onClick={()=>adjustFont(-1)}>A−</button>
                    <span className="pos-scale-val">{fontScale}px</span>
                    <button className="pos-scale-btn" onClick={()=>adjustFont(1)}>A+</button>
                  </div>
                </div>

                <Clock />
              </div>
            </div>

            {/* Search */}
            <div className="pos-search-wrap">
              <svg className="pos-search-icon" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input className="pos-search" placeholder="Search menu items..." value={search} onChange={e=>setSearch(e.target.value)} />
            </div>

            {/* Categories */}
            <div className="pos-cats">
              {categories.map((cat,i) => (
                <button key={i} className={`pos-cat ${category===cat?"active":""}`} onClick={()=>setCategory(cat)}>
                  {catEmoji(cat)} {cat}
                </button>
              ))}
            </div>

            {/* Items Grid */}
            <div className="pos-grid">
              {filteredItems.map(item => (
                <div key={item._id} className="pos-item" onClick={()=>handleItemClick(item)}>
                  <span className="pos-item-emoji">{itemEmoji(item.name)}</span>
                  <div className="pos-item-name">{item.name}</div>
                  <div className="pos-item-price">Rs. {item.portion?.fullPrice ?? item.price ?? 0}</div>
                  {item.portion?.smallPrice != null && (
                    <div className="pos-item-has-portion">✦ Full / Half</div>
                  )}
                  <div className="pos-item-add">+</div>
                </div>
              ))}
              {filteredItems.length===0 && (
                <div style={{gridColumn:"1/-1",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 0",color:"var(--text-muted)",gap:8}}>
                  <span style={{fontSize:36,opacity:.25}}>🔍</span>
                  <span style={{fontSize:13}}>No items found</span>
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT PANEL ── */}
          <div className="pos-right">
            <div className="pos-right-header">

              {/* Cart title */}
              <div className="pos-right-title">
                <span className="pos-right-title-icon">🛒</span>
                Order
                {cart.length>0 && <span className="pos-cart-count">{cart.reduce((s,i)=>s+i.quantity,0)}</span>}
                {cart.length>0 && (
                  <button onClick={clearCart} style={{marginLeft:"auto",fontSize:10,color:"var(--danger)",background:"var(--danger-dim)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:6,padding:"3px 8px",cursor:"pointer",fontFamily:"var(--font)",fontWeight:600}}>
                    Clear
                  </button>
                )}
              </div>

              {/* Customer lookup */}
              <div className="pos-customer-wrap">
                <input
                  className="pos-input" placeholder="📱 Customer phone..."
                  value={phone} onChange={e=>setPhone(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&checkCustomer()}
                />
                <button className="pos-btn-check" onClick={checkCustomer}>Check</button>
              </div>

              {customer && (
                <div className="pos-member-badge">
                  <div className="pos-member-dot" />
                  {customer.name} — {customer.discountPercentage}% member discount
                </div>
              )}

              {/* Payment method */}
              <div className="pos-pay-label" style={{marginBottom:6}}>Payment Method</div>
              <div className="pos-pay-methods" style={{marginBottom:10}}>
                {PAYMENT_METHODS.map(m => (
                  <button key={m.key} className={`pos-pay-btn ${paymentMethod===m.key?m.activeClass:""}`} onClick={()=>setPaymentMethod(m.key)}>
                    <span>{m.icon}</span>{m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Cart items — draggable for reordering */}
            <div className="pos-cart-scroll">
              {cart.length===0 ? (
                <div className="pos-cart-empty">
                  <div className="pos-cart-empty-icon">🛒</div>
                  <span>Cart is empty</span>
                  <span style={{fontSize:11,color:"var(--text-dim)"}}>Tap items to add</span>
                </div>
              ) : cart.map((item, idx) => (
                <div
                  key={item.key}
                  className="pos-cart-item"
                  draggable
                  onDragStart={()=>handleDragStart(idx)}
                  onDragOver={e=>handleDragOver(e,idx)}
                  onDragEnd={handleDragEnd}
                >
                  <span className="pos-cart-item-drag" title="Drag to reorder">⠿</span>
                  <div className="pos-cart-item-info">
                    <div className="pos-cart-item-name">{item.name}</div>
                    {item.portion && item.portion!=="Full" && (
                      <div className="pos-cart-item-portion">{item.portion} portion</div>
                    )}
                    <div className="pos-cart-item-sub">Rs. {(item.price*item.quantity).toLocaleString()}</div>
                  </div>
                  <div className="pos-qty-ctrl">
                    <button className="pos-qty-btn" onClick={()=>updateQuantity(item.key,"dec")}>−</button>
                    <span className="pos-qty">{item.quantity}</span>
                    <button className="pos-qty-btn" onClick={()=>updateQuantity(item.key,"inc")}>+</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="pos-footer">
              <div className="pos-totals">
                <div className="pos-total-row">
                  <span>Subtotal</span>
                  <span style={{fontFamily:"var(--mono)"}}>Rs. {subtotal.toLocaleString()}</span>
                </div>
                {customer && discountAmt>0 && (
                  <div className="pos-total-row pos-discount-row">
                    <span>Discount ({customer.discountPercentage}%)</span>
                    <span style={{fontFamily:"var(--mono)"}}>− Rs. {discountAmt.toLocaleString()}</span>
                  </div>
                )}
                <div className="pos-total-row grand">
                  <span className="label">Total</span>
                  <span>Rs. {getTotal().toLocaleString()}</span>
                </div>
              </div>
              <button
                className={`pos-checkout-btn${paymentMethod==="Unpaid"?" unpaid-mode":""}`}
                onClick={()=>setShowCheckoutModal(true)}
                disabled={cart.length===0}
              >
                {paymentMethod==="Unpaid" ? "⏳ Save as Unpaid" : "⚡ Checkout"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
