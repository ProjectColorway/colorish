import "./style.css";

import React, { Context } from "react";
import ReactDOM from "react-dom/client";

import { Contexts, Dispatcher, Styles } from "./api";
import { colorToHex } from "./api/Colors";
import { setContext } from "./api/Contexts";
import { simpleContexts } from "./api/Hooks";
import App from "./App";
import { getAutoPresets } from "./css";
import { ColorwayObject, ContextKey } from "./types";

async function setOsColor() {
    if ((window as any).getSystemColor) {
        const osColor = await getSystemColor();
        Styles.setStyle("dc-os-color-css", `:root {--os-accent-color: ${osColor["os-accent-color"]}}`);
    }
}

setOsColor();
if ((window as any).onOsColorChanged) {
    onOsColorChanged(() => {
        const [contexts, destroyContexts] = simpleContexts();
        setOsColor();
        if (contexts().activeColorwayObject.id === "Auto" && contexts().activeColorwayObject.sourceType === "auto") {
            const { colors } = getAutoPresets(colorToHex(getComputedStyle(document.body).getPropertyValue("--os-accent-color")).slice(0, 6))[contexts().activeAutoPreset];
            const newObj: ColorwayObject = {
                id: "Auto",
                sourceType: "auto",
                source: null,
                colors: colors
            };
            if (!contexts().isConnected) {
                setContext("activeColorwayObject", newObj);
            } else {
                if (contexts().hasManagerRole) {
                    Dispatcher.emit("COLORWAYS_SEND_COLORWAY", {
                        active: newObj
                    });
                }
            }
        }

        return destroyContexts();
    });
}

Contexts.initContexts().then(async context => {
    document.getElementById("app-root")!.className = "theme-" + context.colorwaysAppTheme;
});

const root = ReactDOM.createRoot(document.getElementById("app-root") as HTMLElement);
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

Dispatcher.addListener("COLORWAYS_CONTEXT_UPDATED", <Key extends ContextKey>(payload) => {
    const { c, value }: { c: Key, value: Context<Key>; } = payload as any;
    if (c === "colorwaysAppTheme") document.getElementById("app-root")!.className = "theme-" + value;
});
