const { app, BrowserWindow } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const net = require("net");
const fs = require("fs");

let mainWindow;
let backendProcess;
const isDev = !app.isPackaged;

const loadingHtml = (msg = "Starting POS...") => `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>CaptainCafePOS</title>
  <style>
    body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0f1117;color:#e8ecff;font-family:Arial,sans-serif}
    .card{width:360px;max-width:92vw;border:1px solid rgba(255,255,255,.1);border-radius:14px;padding:24px;background:#171c2c}
    .title{font-size:20px;font-weight:700;margin-bottom:8px}
    .sub{font-size:13px;color:#9ea7cc;margin-bottom:14px}
    .row{display:flex;align-items:center;gap:10px}
    .dot{width:9px;height:9px;border-radius:50%;background:#f5a623;animation:p 1s infinite ease-in-out}
    .dot:nth-child(2){animation-delay:.15s}.dot:nth-child(3){animation-delay:.3s}
    @keyframes p{0%,80%,100%{transform:scale(.7);opacity:.4}40%{transform:scale(1);opacity:1}}
    .msg{font-size:12px;color:#8d97be;margin-top:10px}
  </style>
</head>
<body>
  <div class="card">
    <div class="title">CaptainCafePOS</div>
    <div class="sub">Please wait while the app initializes</div>
    <div class="row"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>
    <div class="msg">${msg}</div>
  </div>
</body>
</html>`;

const errorHtml = (title, details) => `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Startup Error</title>
  <style>
    body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0f1117;color:#e8ecff;font-family:Arial,sans-serif}
    .card{width:700px;max-width:94vw;border:1px solid rgba(239,68,68,.35);border-radius:14px;padding:24px;background:#171c2c}
    .title{font-size:22px;font-weight:700;color:#ffb2bb;margin-bottom:8px}
    .sub{font-size:13px;color:#9ea7cc;margin-bottom:12px}
    pre{white-space:pre-wrap;word-break:break-word;background:#111827;padding:12px;border-radius:10px;border:1px solid rgba(255,255,255,.08);color:#dbe6ff;font-size:12px}
  </style>
</head>
<body>
  <div class="card">
    <div class="title">${title}</div>
    <div class="sub">The app could not start correctly. See details below:</div>
    <pre>${details}</pre>
  </div>
</body>
</html>`;

const waitForPort = (port, host = "127.0.0.1", timeoutMs = 15000) =>
  new Promise((resolve, reject) => {
    const started = Date.now();
    const check = () => {
      const socket = new net.Socket();
      socket.setTimeout(1000);
      socket.once("connect", () => {
        socket.destroy();
        resolve();
      });
      socket.once("error", () => {
        socket.destroy();
        if (Date.now() - started >= timeoutMs) {
          reject(new Error(`Timeout waiting for ${host}:${port}`));
        } else {
          setTimeout(check, 250);
        }
      });
      socket.once("timeout", () => {
        socket.destroy();
        if (Date.now() - started >= timeoutMs) {
          reject(new Error(`Timeout waiting for ${host}:${port}`));
        } else {
          setTimeout(check, 250);
        }
      });
      socket.connect(port, host);
    };
    check();
  });

function startBackend() {
  const backendEntry = isDev
    ? path.join(__dirname, "server", "server.js")
    : path.join(process.resourcesPath, "server", "server.js");

  backendProcess = spawn(process.execPath, [backendEntry], {
    env: { ...process.env, ELECTRON_RUN_AS_NODE: "1" },
    stdio: "inherit",
  });

  backendProcess.on("exit", (code) => {
    console.log(`Backend process exited with code ${code}`);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    autoHideMenuBar: true,
  });

  mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(loadingHtml())}`);

  mainWindow.webContents.on("did-fail-load", (_event, code, desc, url) => {
    mainWindow.loadURL(
      `data:text/html;charset=utf-8,${encodeURIComponent(
        errorHtml("Renderer Failed to Load", `Error code: ${code}\nDescription: ${desc}\nURL: ${url}`)
      )}`
    );
  });

  mainWindow.webContents.on("render-process-gone", (_event, details) => {
    mainWindow.loadURL(
      `data:text/html;charset=utf-8,${encodeURIComponent(
        errorHtml("Renderer Process Crashed", JSON.stringify(details, null, 2))
      )}`
    );
  });
}

async function loadRendererApp() {
  if (!mainWindow) return;
  try {
    if (isDev) {
      await mainWindow.loadURL("http://localhost:5173");
      return;
    }

    const indexPath = path.join(process.resourcesPath, "client-dist", "index.html");
    if (!fs.existsSync(indexPath)) {
      await mainWindow.loadURL(
        `data:text/html;charset=utf-8,${encodeURIComponent(
          errorHtml("Frontend Files Missing", `Could not find:\n${indexPath}`)
        )}`
      );
      return;
    }

    await mainWindow.loadFile(indexPath);
  } catch (error) {
    await mainWindow.loadURL(
      `data:text/html;charset=utf-8,${encodeURIComponent(
        errorHtml("Startup Error", error?.stack || String(error))
      )}`
    );
  }
}

app.whenReady().then(async () => {
  startBackend();
  createWindow();
  try {
    await waitForPort(5000);
  } catch (e) {
    if (mainWindow) {
      await mainWindow.loadURL(
        `data:text/html;charset=utf-8,${encodeURIComponent(
          errorHtml("Backend Startup Timeout", `${e.message}\n\nExpected API: http://localhost:5000`)
        )}`
      );
    }
    return;
  }
  await loadRendererApp();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
      loadRendererApp();
    }
  });
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", () => {
  if (backendProcess && !backendProcess.killed) {
    backendProcess.kill();
  }
});
