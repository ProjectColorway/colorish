import fs from "node:fs";

import { electronApp, is, optimizer } from "@electron-toolkit/utils";
import { app, BrowserWindow, ipcMain, shell, systemPreferences } from "electron";
import mime from "mime-types";
import { join } from "path";

import icon from "../../resources/icon.png?asset";
import { Contexts } from "./api";
import AuthClient from "./api/Services/auth";
import { IpcEvents } from "./IpcEvents";

let mainWindow: BrowserWindow;
const authClient = new AuthClient();

function createWindow(): void {
    mainWindow = new BrowserWindow({
        width: 460,
        maxWidth: 460,
        height: 800,
        titleBarStyle: "hidden",
        title: "Colorish",
        resizable: false,
        backgroundColor: "#313338",
        ...(process.platform === "linux" ? { icon } : {}),
        webPreferences: {
            preload: join(__dirname, "../preload/index.js"),
            sandbox: false
        }
    });

    mainWindow.on("ready-to-show", () => {
        mainWindow?.show();
    });

    mainWindow.webContents.setWindowOpenHandler(details => {
        shell.openExternal(details.url);
        return { action: "deny" };
    });

    if (is.dev && process.env.ELECTRON_RENDERER_URL) {
        mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
    } else {
        mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
    }
}

ipcMain.handle("begin-auth", () => {
    authClient.authenticate();
});

/**
 * Emits an event to the ipcRenderer, with the authorization result
 * @param status Discord authorization result
 */
export const setAuthResult = (status: { username: string, image: string; }) => {
    mainWindow.webContents.send(
        "authData", status
    );

    mainWindow.show();
    mainWindow.focus();

    authClient.stopListening();
};

app.whenReady().then(() => {
    electronApp.setAppUserModelId("com.electron");

    app.on("browser-window-created", (_, window) => {
        optimizer.watchWindowShortcuts(window);
    });

    createWindow();

    Contexts.initContexts();

    app.on("activate", function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.

ipcMain.handle("get-colorish-ui", (_, path) => {
    try {
        const data = fs.readFileSync(join(__dirname, "../renderer", path), "utf8");
        return { html: data, mime: mime.lookup(path) };
    } catch (e) {
        return { html: `<html><head><title>Internal Server Error</title></head><body><h1>Internal Server Error</h1><h3>${e}</h1></body></html>`, mime: "text/html" };
    }
});

ipcMain.handle(IpcEvents.OPEN_WINDOW, (_, html) => {
    const win = new BrowserWindow({
        width: 1040,
        height: 800,
        frame: false,
        backgroundColor: "#313338",
        ...(process.platform === "linux" ? { icon } : {}),
        webPreferences: {
            preload: join(__dirname, "../preload/index.js"),
            sandbox: false
        }
    });

    win.on("ready-to-show", () => {
        win?.show();
    });

    win.loadURL("data:text/html;charset=UTF-8," + encodeURIComponent(html), {
        baseURLForDataURL: `file://${join(__dirname, "../renderer")}`
    });
});

ipcMain.handle(IpcEvents.GET_THEME_SYSTEM_VALUES, () => ({
    // win & mac only
    "os-accent-color": `#${systemPreferences.getAccentColor?.() || ""}`
}));

ipcMain.handle(IpcEvents.SAVE_COLORWAY, () => {
    mainWindow && mainWindow.webContents.send(IpcEvents.SAVE_COLORWAY);
});

ipcMain.handle("dc-toggle-maximize", () => {
    if (mainWindow) {
        if (mainWindow.isMaximized()) mainWindow.restore();
        else mainWindow.maximize();
    }
});

ipcMain.handle("dc-minimize", () => {
    if (mainWindow) mainWindow.minimize();
});

ipcMain.handle("dc-close", () => {
    if (mainWindow) mainWindow.close();
});

ipcMain.handle("dc-focus", () => {
    if (mainWindow) mainWindow.focus();
});

systemPreferences.addListener("accent-color-changed", () => {
    mainWindow?.webContents.send("DcAccentColorChanged");
});
