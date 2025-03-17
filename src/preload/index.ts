import { contextBridge, ipcRenderer } from 'electron';
import { get, set } from "./DataStore";
import { ColorwayObject, WsClient } from "./types";
import { WebSocketServer } from "ws";

function isSameBoundKey(boundKey1, boundKey2) {
    return (Object.keys(boundKey1)[0] === Object.keys(boundKey2)[0]) && Object.values(boundKey1)[0] === Object.values(boundKey2)[0];
}

let wsClients: WsClient[] = [];

contextBridge.exposeInMainWorld("setMainCSS", (id, css) => {
    ipcRenderer.invoke("DcSetCss", id, css);
});

contextBridge.exposeInMainWorld("removeMainCSS", (id) => {
    ipcRenderer.invoke("DcRemoveCss", id);
});

contextBridge.exposeInMainWorld("getSystemColor", () => ipcRenderer.invoke("DcGetThemeSystemValues"));

contextBridge.exposeInMainWorld("electron_api", {
    getCurrentWindow: () => ipcRenderer.invoke("DcGetCurrentWindow")
});

contextBridge.exposeInMainWorld("onOsColorChanged", (callback) => {
    ipcRenderer.addListener("DcAccentColorChanged", callback);
});

ipcRenderer.addListener("bound-clients-updated", (_, wscl) => {
    wsClients = wscl;
});

let MID: any;
get("UUID").then(UUID => {
    if (!UUID) {
        var array = new Uint32Array(1);
        window.crypto.getRandomValues(array);
        set("UUID", array[0]);
        MID = String(array[0]);
    } else {
        MID = String(UUID);
    }
});

const wsManager = new WebSocketServer({ port: 6124 });

contextBridge.exposeInMainWorld("dc_win", {
    minimize() {
        ipcRenderer.invoke("dc-minimize");
    },
    focus() {
        ipcRenderer.invoke("dc-focus");
    },
    toggleMaximize() {
        ipcRenderer.invoke("dc-toggle-maximize");
    },
    close() {
        ipcRenderer.invoke("dc-close");
    },
    getWsClients() {
        return wsClients;
    },
    openWindow(HTML) {
        ipcRenderer.invoke("DcOpenWindow", HTML);
    },
    changeManagerRoleState(boundKey: { [x: number]: string; }, enabled: boolean) {
        (wsClients.find(ws => isSameBoundKey(JSON.parse(ws.boundKey), boundKey)) as WsClient).isManager = enabled;
    }
});

wsManager.on("connection", function connection(wss: WsClient) {
    const ws: WsClient = Object.assign(wss, {
        dispatch: (event: string, data = {}) => {
            wss.send(JSON.stringify({
                type: event,
                ...data
            }));
        },
        boundKey: "",
        isManager: false,
        complications: [],
        online: [],
        offline: [],
        changeColorway: (activeColorwayObject: ColorwayObject) => wss.send(JSON.stringify({ type: "change-colorway", active: activeColorwayObject })),
        removeColorway: () => wss.send(JSON.stringify({ type: "remove-colorway" })),
        onclose: onwsexit,
        onerror: onwsexit
    });

    const wsPos = wsClients.push(ws) - 1;

    function onwsexit() {
        wsClients.splice(wsPos, 1);
    }

    Object.assign(ws, {
        onmessage: (
            { data: dataRaw }: {
                data: string;
            }
        ) => {
            const data = JSON.parse(dataRaw);
            const { type } = data;
            switch (type) {
                case "client-sync-established": ws.boundKey = data.boundKey;
                    ws.complications = data.complications;
                    return;
                case "complication:remote-sources:init": ws.online = data.online;
                    ws.offline = data.offline;
                    return;
                case "complication:manager-role:send-colorway":
                    if (ws.isManager) {
                        set("activeColorwayObject", data.active);
                        wsClients.forEach((w) => w.dispatch("change-colorway", { active: data.active }));
                        window.postMessage({
                            type: "complication:manager-role:receive-colorway",
                            active: data.active
                        });
                    }
                    return;
                case "complication:manager-role:request":
                    if (!ws.isManager) window.postMessage({
                        type: "complication:manager-role:request",
                        boundKey: data.boundKey
                    });
                    ipcRenderer.invoke("dc-focus");
                    return;
            }
        }
    });
    ws.dispatch("manager-connection-established", { MID });
});
