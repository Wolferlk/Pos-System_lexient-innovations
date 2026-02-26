const { app, BrowserWindow } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const net = require("net");
const fs = require("fs");
const killPort = require("kill-port");

let mainWindow;
let backendProcess;
const isDev = !app.isPackaged;
let backendLogs = "";
let rendererLogs = "";
let logFilePath = "";

// Some Windows devices show a black/blank Electron window with GPU rendering.
// Disabling hardware acceleration makes rendering deterministic for POS installs.
app.disableHardwareAcceleration();

const appendLog = (line) => {
  try {
    const text = `[${new Date().toISOString()}] ${line}\n`;
    if (logFilePath) fs.appendFileSync(logFilePath, text, "utf-8");
  } catch (_) {
    // Ignore log file failures.
  }
};

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
    <div class="title">Captain's Cafe POS By Lexient Innovations</div>
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

const waitForPort = (port, host = "127.0.0.1", timeoutMs = 30000) =>
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
  const serverDir = isDev
    ? path.join(__dirname, "server")
    : path.join(process.resourcesPath, "server");
  const backendEntry = path.join(serverDir, "server.js");

  backendProcess = spawn(process.execPath, [backendEntry], {
    env: { ...process.env, ELECTRON_RUN_AS_NODE: "1" },
    cwd: serverDir,
    stdio: ["ignore", "pipe", "pipe"],
  });

  backendProcess.stdout.on("data", (chunk) => {
    const msg = chunk.toString();
    backendLogs += msg;
    if (backendLogs.length > 8000) backendLogs = backendLogs.slice(-8000);
    console.log(msg.trim());
    appendLog(`[BACKEND][OUT] ${msg.trim()}`);
  });

  backendProcess.stderr.on("data", (chunk) => {
    const msg = chunk.toString();
    backendLogs += msg;
    if (backendLogs.length > 8000) backendLogs = backendLogs.slice(-8000);
    console.error(msg.trim());
    appendLog(`[BACKEND][ERR] ${msg.trim()}`);
  });

  backendProcess.on("exit", (code) => {
    console.log(`Backend process exited with code ${code}`);
    appendLog(`[BACKEND] exit code ${code}`);
  });
}

function stopBackend() {
  if (backendProcess && !backendProcess.killed) {
    backendProcess.kill();
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    backgroundColor: "#0f1117",
    autoHideMenuBar: true,
    icon: path.join(__dirname, "assets", "captainlogo.ico"), // ✅ FIXED
  });

  mainWindow.loadURL(
    `data:text/html;charset=utf-8,${encodeURIComponent(
      loadingHtml()
    )}`
  );

  mainWindow.webContents.on(
    "console-message",
    (_event, level, message, line, sourceId) => {
      const msg = `[RENDERER][L${level}] ${message} (${sourceId}:${line})`;
      rendererLogs += `${msg}\n`;
      if (rendererLogs.length > 8000)
        rendererLogs = rendererLogs.slice(-8000);
      appendLog(msg);
    }
  );

  mainWindow.webContents.on("did-fail-load", (_event, code, desc, url) => {
    mainWindow.loadURL(
      `data:text/html;charset=utf-8,${encodeURIComponent(
        errorHtml(
          "Renderer Failed to Load",
          `Error code: ${code}\nDescription: ${desc}\nURL: ${url}`
        )
      )}`
    );
  });

  mainWindow.webContents.on("render-process-gone", (_event, details) => {
    mainWindow.loadURL(
      `data:text/html;charset=utf-8,${encodeURIComponent(
        errorHtml(
          "Renderer Process Crashed",
          JSON.stringify(details, null, 2)
        )
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

    // Detect blank renderer (React not mounted / JS fatal) and show explicit diagnostics.
    setTimeout(async () => {
      if (!mainWindow || mainWindow.isDestroyed()) return;
      try {
        const probe = await mainWindow.webContents.executeJavaScript(`
          (() => {
            const root = document.getElementById("root");
            return {
              href: location.href,
              hasRoot: !!root,
              childCount: root ? root.childElementCount : -1,
              bodyText: (document.body?.innerText || "").trim().slice(0, 400)
            };
          })();
        `);

        if (probe && probe.hasRoot && probe.childCount === 0) {
          await mainWindow.loadURL(
            `data:text/html;charset=utf-8,${encodeURIComponent(
              errorHtml(
                "Renderer Loaded But UI Not Mounted",
                `Detected blank UI after startup.\n\nURL: ${probe.href}\nRoot child count: ${probe.childCount}\nBody text: ${probe.bodyText || "(empty)"}\n\nRenderer log tail:\n${rendererLogs || "(no renderer logs)"}\n\nBackend log tail:\n${backendLogs || "(no backend logs)"}\n\nStartup log file:\n${logFilePath || "(not set)"}`
              )
            )}`
          );
        }
      } catch (probeError) {
        appendLog(`[MAIN] renderer probe failed: ${probeError?.message || probeError}`);
      }
    }, 6000);
  } catch (error) {
    await mainWindow.loadURL(
      `data:text/html;charset=utf-8,${encodeURIComponent(
        errorHtml("Startup Error", error?.stack || String(error))
      )}`
    );
  }
}

app.whenReady().then(async () => {
  logFilePath = path.join(app.getPath("userData"), "startup.log");
  appendLog(`[MAIN] app start. isPackaged=${isDev ? "false" : "true"}`);
  appendLog(`[MAIN] userData=${app.getPath("userData")}`);

  try {
    await killPort(5000);
    appendLog("[MAIN] cleared stale process on port 5000");
  } catch (_) {
    appendLog("[MAIN] port 5000 already free");
  }

  startBackend();
  createWindow();
  try {
    await waitForPort(5000);
  } catch (e) {
    appendLog("[MAIN] backend timeout; retrying backend start once");
    stopBackend();
    try {
      await killPort(5000);
    } catch (_) {
      // ignore
    }
    startBackend();
    try {
      await waitForPort(5000, "127.0.0.1", 30000);
    } catch (retryError) {
      if (mainWindow) {
        await mainWindow.loadURL(
          `data:text/html;charset=utf-8,${encodeURIComponent(
            errorHtml(
              "Backend Startup Timeout",
              `${retryError.message}\n\nExpected API: http://localhost:5000\n\nBackend log tail:\n${backendLogs || "(no logs captured)"}\n\nStartup log file:\n${logFilePath || "(not set)"}`
            )
          )}`
        );
      }
      return;
    }
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
  stopBackend();
});

process.on("uncaughtException", (err) => {
  appendLog(`[MAIN][UNCAUGHT] ${err?.stack || err}`);
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.loadURL(
      `data:text/html;charset=utf-8,${encodeURIComponent(
        errorHtml("Main Process Uncaught Exception", `${err?.stack || err}\n\nStartup log file:\n${logFilePath || "(not set)"}`)
      )}`
    );
  }
});

process.on("unhandledRejection", (reason) => {
  appendLog(`[MAIN][REJECTION] ${reason?.stack || reason}`);
});
