import React from "react";
import Sidebar from "../components/Sidebar";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

  :root {
    --bg-base:    #0f1117;
    --bg-card:    #1a1d27;
    --border:     rgba(255,255,255,0.06);
    --text-muted: #6b7499;
    --accent:     #f5a623;
    --font:       'Sora', sans-serif;
    --mono:       'JetBrains Mono', monospace;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .ml-root {
    display: flex;
    height: 100vh;
    width: 100vw;
    overflow: hidden;
    background: var(--bg-base);
    font-family: var(--font);
  }

  /* ── Main content area ── */
  .ml-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
  }

  /* subtle grid dot background */
  .ml-main::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: radial-gradient(circle, rgba(255,255,255,0.035) 1px, transparent 1px);
    background-size: 28px 28px;
    pointer-events: none;
    z-index: 0;
  }

  /* soft ambient glow top-right */
  .ml-main::after {
    content: '';
    position: absolute;
    top: -120px; right: -80px;
    width: 400px; height: 400px;
    background: radial-gradient(circle, rgba(245,166,35,0.06) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
  }

  .ml-content {
    flex: 1;
    overflow-y: auto;
    padding: 28px 32px;
    position: relative;
    z-index: 1;
  }

  .ml-content::-webkit-scrollbar { width: 5px; }
  .ml-content::-webkit-scrollbar-track { background: transparent; }
  .ml-content::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }
  .ml-content::-webkit-scrollbar-thumb:hover { background: rgba(245,166,35,0.3); }
`;

export default function MainLayout({ children }) {
  return (
    <>
      <style>{styles}</style>
      <div className="ml-root">
        <Sidebar />
        <div className="ml-main">
          <div className="ml-content">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}