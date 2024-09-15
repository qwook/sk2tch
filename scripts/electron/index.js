const steamworks = require("steamworks.js");
const { app, BrowserWindow, Menu } = require("electron");
const { ipcMain } = require("electron/main");
const path = require("path");
const fs = require("fs");
const { mkdirp } = require("mkdirp");

let client;
try {
  client = steamworks.init(2824230);
} catch (e) {}

const cloudEnabled =
  client &&
  client?.cloud.writeFile("check.sav", (Math.random() * 100000).toString());

let appPath = app.getPath("userData");

if (process.env.NODE_ENV !== "development") {
  Menu.setApplicationMenu(null);
}

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600 + /* Top bar */ 28,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: false,
      nodeIntegration: true,
    },
  });

  win.setAspectRatio(800 / 600);

  ipcMain.on("set-fullscreen", (event, arg) => {
    win.setFullScreen(arg);
  });

  ipcMain.on("quit-app", (event) => {
    win.close();
  });

  let memSave = {};

  ipcMain.on("save-key", (event, key, value) => {
    if (cloudEnabled) {
      const save = client?.cloud.fileExists("all.sav")
        ? JSON.parse(client?.cloud.readFile("all.sav"))
        : {};
      save[key] = value;
      client?.cloud.writeFile("all.sav", JSON.stringify(save));
    } else {
      // memSave[key] = value;
      // return;
      mkdirp.sync(path.join(appPath, "saves"));
      const save = fs.existsSync(path.join(appPath, "saves", "all.sav"))
        ? JSON.parse(fs.readFileSync(path.join(appPath, "saves", "all.sav")))
        : {};
      save[key] = value;
      fs.writeFileSync(
        path.join(appPath, "saves", "all.sav"),
        JSON.stringify(save)
      );
    }
  });

  ipcMain.on("load-key", (event, key) => {
    if (cloudEnabled) {
      try {
        const save = client?.cloud.fileExists("all.sav")
          ? JSON.parse(client?.cloud.readFile("all.sav"))
          : {};
        event.returnValue = save[key];
      } catch (e) {
        event.returnValue = null;
      }
    } else {
      // event.returnValue = memSave[key];
      // return;
      mkdirp.sync(path.join(appPath, "saves"));
      const save = fs.existsSync(path.join(appPath, "saves", "all.sav"))
        ? JSON.parse(fs.readFileSync(path.join(appPath, "saves", "all.sav")))
        : {};
      event.returnValue = save[key];
    }
  });

  if (process.env.NODE_ENV === "development") {
    win.loadURL("http://localhost:9000");
  } else {
    win.loadFile(path.join(__dirname, "game", "index.html"));
  }
};

app.whenReady().then(() => {
  createWindow();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  if (process.platform !== "darwin") {
    app.on("window-all-closed", function () {
      app.quit();
    });
  }
});

app.commandLine.appendSwitch("disable-software-rasterizer");
steamworks.electronEnableSteamOverlay();
