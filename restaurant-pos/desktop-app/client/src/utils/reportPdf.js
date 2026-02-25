const esc = (v) =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export function generateDetailedReportPdf({
  title,
  subtitle = "",
  filters = [],
  summary = [],
  columns = [],
  rows = [],
}) {
  const win = window.open("", "_blank", "width=1200,height=800");
  if (!win) {
    alert("Popup blocked. Please allow popups to generate PDF.");
    return;
  }

  const now = new Date().toLocaleString();
  const filtersHtml = filters
    .filter((f) => f?.value !== undefined && f?.value !== null && String(f.value).trim() !== "")
    .map((f) => `<div class="chip"><b>${esc(f.label)}:</b> ${esc(f.value)}</div>`)
    .join("");
  const summaryHtml = summary
    .map((s) => `<div class="sum"><div class="k">${esc(s.label)}</div><div class="v">${esc(s.value)}</div></div>`)
    .join("");
  const thead = `<tr>${columns.map((c) => `<th>${esc(c)}</th>`).join("")}</tr>`;
  const tbody = rows
    .map(
      (r) =>
        `<tr>${r
          .map((cell) => `<td>${esc(cell)}</td>`)
          .join("")}</tr>`
    )
    .join("");

  win.document.write(`<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${esc(title)}</title>
  <style>
    body { font-family: Arial, sans-serif; color: #0f172a; margin: 20px; }
    .head { display:flex; justify-content:space-between; align-items:flex-end; gap:10px; margin-bottom:10px; }
    h1 { margin:0; font-size:22px; }
    .sub { color:#475569; margin-top:4px; font-size:12px; }
    .gen { font-size:11px; color:#64748b; }
    .filters { display:flex; flex-wrap:wrap; gap:8px; margin:12px 0 14px; }
    .chip { border:1px solid #cbd5e1; border-radius:999px; padding:4px 10px; font-size:11px; }
    .summary { display:grid; grid-template-columns: repeat(auto-fit,minmax(160px,1fr)); gap:8px; margin-bottom:14px; }
    .sum { border:1px solid #cbd5e1; border-radius:8px; padding:8px; }
    .sum .k { font-size:11px; color:#64748b; }
    .sum .v { font-size:16px; font-weight:700; margin-top:2px; }
    table { width:100%; border-collapse:collapse; font-size:11px; }
    th, td { border:1px solid #cbd5e1; padding:6px; text-align:left; vertical-align:top; }
    th { background:#f1f5f9; font-size:10px; text-transform:uppercase; letter-spacing:0.4px; }
    .muted { color:#64748b; margin-top:8px; font-size:11px; }
    @media print {
      @page { size: A4 landscape; margin: 12mm; }
      body { margin: 0; }
    }
  </style>
</head>
<body>
  <div class="head">
    <div>
      <h1>${esc(title)}</h1>
      <div class="sub">${esc(subtitle)}</div>
    </div>
    <div class="gen">Generated: ${esc(now)}</div>
  </div>
  <div class="filters">${filtersHtml || "<span class='muted'>No filters applied</span>"}</div>
  <div class="summary">${summaryHtml}</div>
  <table>
    <thead>${thead}</thead>
    <tbody>${tbody || `<tr><td colspan="${columns.length || 1}">No data</td></tr>`}</tbody>
  </table>
  <div class="muted">Tip: choose "Save as PDF" in print dialog.</div>
  <script>window.onload = () => setTimeout(() => window.print(), 150);</script>
</body>
</html>`);
  win.document.close();
}
