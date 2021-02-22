const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");

if (process.platform === "win32") {
  app.setAppUserModelId(app.name);
}

require("electron-reload")(__dirname, {
  electron: path.join(__dirname, "node_modules", ".bin", "electron"),
});

delete process.env.ELECTRON_ENABLE_SECURITY_WARNINGS;
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = true;

const localDirectory = path.resolve(__dirname + "/../");
const directoryLength = localDirectory.length;

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false,
    },
  });

  win.loadFile("screens/index.html");
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.on("originDirectory", (event) => {
  dialog
    .showOpenDialog({
      defaultPath: `C:\\Users\\${process.env.USERNAME}\\Documents`,
      properties: ["openFile"],
      filters: [{ name: "zip", extensions: ["zip"] }],
    })
    .then((result) => {
      if (result.filePaths.length > 0) {
        currentPath = result.filePaths[0];
        let name = currentPath.slice(
          currentPath.lastIndexOf("\\") + 1,
          currentPath.length
        );
        event.reply("originDirectory-reply", { path: currentPath, name: name });
      }
    })
    .catch((err) => {
      console.log(err);
      event.reply("originDirectory-reply", false);
    });
});

ipcMain.on("executableInDirectory", (event, name) => {
  dialog
    .showOpenDialog({
      defaultPath: `${name}`,
      properties: ["openFile"],
    })
    .then((result) => {
      if (result.filePaths.length > 0) {
        event.reply("executableInDirectory-reply", result.filePaths[0]);
      }
    })
    .catch((err) => {
      console.log(err);
    });
});
