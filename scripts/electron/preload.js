const { ipcRenderer } = require("electron/renderer");
const steamworks = require("steamworks.js");

let init;
try {
  init = steamworks.init(2824230);
} catch (e) {}

window.electronAPI = {
  isSteamBigMode: () => process.env.SteamTenfoot === "true",
  setFullscreen: (fullscreen) => ipcRenderer.send("set-fullscreen", fullscreen),
  quitApp: () => ipcRenderer.send("quit-app"),
  saveKey: (key, value) => ipcRenderer.send("save-key", key, value),
  loadKey: (key) => ipcRenderer.sendSync("load-key", key) || null,
  steamworks: init,
};
