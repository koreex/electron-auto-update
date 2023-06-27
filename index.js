const { app, BrowserWindow, ipcMain, globalShortcut } = require("electron");
const path = require("path");
const { autoUpdater } = require("electron-updater");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    overflow: "hidden",
    frameless: true,
    kiosk: false,
    resizable: true,
    maximizable: false,
    frame: true,
    autoHideMenuBar: true,

    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // Lock window at 16:9
  mainWindow.setAspectRatio(16 / 9);
  // End Lock window at 16:9

  let page = "home";
  mainWindow.loadFile("src/index.html");

  mainWindow.webContents.openDevTools();

  // Register the shortcut for fullscreen mode
  globalShortcut.register("F11", () => {
    mainWindow.setFullScreen(!mainWindow.isFullScreen());
  });

  // Register the shortcut for exiting fullscreen mode
  globalShortcut.register("Escape", () => {
    mainWindow.setFullScreen(false);
  });
}

// Minimize and close window
ipcMain.on("minimize-window", () => {
  mainWindow.minimize();
});

ipcMain.on("close-window", () => {
  mainWindow.close();
});

ipcMain.on("app_version", (event) => {
  event.sender.send("app_version", { version: app.getVersion() });
});

ipcMain.on("check_update", () => {
  autoUpdater.checkForUpdatesAndNotify();
});

app.whenReady().then(() => {
  createWindow();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  app.on("will-quit", () => {
    // Unregister all shortcuts
    globalShortcut.unregisterAll();
  });
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});

// Path: preload.js
try {
  require("electron-reloader")(module);
} catch (_) {}
