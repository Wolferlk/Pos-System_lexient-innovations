const { app, BrowserWindow } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const net = require("net");

let mainWindow;
let backendProcess;
const isDev = !app.isPackaged;

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
    ? path.join(__dirname, "..", "server", "server.js")
    : path.join(process.resourcesPath, "server", "server.js");

  // Use Electron binary as Node runtime so client PC does not need Node installed.
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

  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
  } else {
    const indexPath = path.join(process.resourcesPath, "client-dist", "index.html");
    mainWindow.loadFile(indexPath);
  }
}

app.whenReady().then(async () => {
  startBackend();
  try {
    await waitForPort(5000);
  } catch (e) {
    console.warn(`Backend startup check warning: ${e.message}`);
  }
  createWindow();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0)
      createWindow();
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
