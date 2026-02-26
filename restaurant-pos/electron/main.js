const { app, BrowserWindow, dialog } = require("electron");
const path = require("path");
const { fork } = require("child_process");
const axios = require("axios");
const kill = require("kill-port");

let backendProcess;
let mainWindow;

const isDev = process.env.NODE_ENV !== "production";

const serverPath = isDev
  ? path.join(__dirname, "..", "backend", "server.js")
  : path.join(process.resourcesPath, "backend", "server.js");

const BACKEND_URL = "http://127.0.0.1:5000";
const MAX_RETRIES = 40; // 40 seconds max wait

// ----------------------------------------------------
// Start Backend Process
// ----------------------------------------------------
function startBackend() {
  console.log(`🚀 Starting backend at: ${serverPath}`);

  backendProcess = fork(serverPath, [], {
    stdio: "inherit",
  });

  backendProcess.on("error", (err) => {
    console.error("❌ Backend process error:", err);
  });

  backendProcess.on("exit", (code, signal) => {
    console.log(`⚠ Backend exited (code: ${code}, signal: ${signal})`);
  });
}

// ----------------------------------------------------
// Wait Until Backend Is Ready
// ----------------------------------------------------
async function waitForBackend() {
  console.log("⏳ Waiting for backend...");

  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      await axios.get(`${BACKEND_URL}/health`);
      console.log("✅ Backend is ready");
      return;
    } catch (err) {
      await new Promise((res) => setTimeout(res, 1000));
    }
  }

  throw new Error("Backend failed to start within timeout.");
}

// ----------------------------------------------------
// Create Main Window
// ----------------------------------------------------
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const startUrl = isDev
    ? "http://localhost:3000"
    : `file://${path.join(__dirname, "../build/index.html")}`;

  mainWindow.loadURL(startUrl);

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });
}

// ----------------------------------------------------
// App Ready (CORRECT PLACE)
// ----------------------------------------------------
app.whenReady().then(async () => {
  try {
    console.log("🔍 Checking port 5000...");

    // Kill port if already running
    try {
      await kill(5000);
      console.log("⚠ Old backend process killed");
    } catch {
      console.log("✅ Port 5000 is free");
    }

    startBackend();
    await waitForBackend();
    createWindow();

  } catch (error) {
    console.error("❌ Startup failed:", error);

    dialog.showErrorBox(
      "Startup Error",
      "POS system failed to start properly.\n\nPlease restart the application."
    );

    app.quit();
  }
});

// ----------------------------------------------------
// Graceful Shutdown
// ----------------------------------------------------
app.on("before-quit", () => {
  console.log("🛑 Closing backend...");

  if (backendProcess) {
    backendProcess.kill();
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});