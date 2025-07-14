import { nullColorwayObj } from "../../constants";
import { getFiltered } from "../";
import { app, ipcMain } from "electron";
import { resolve, join } from "path";
import fs, { readFileSync } from "node:fs";

let dataPath = "";
if (process.platform === "win32" || process.platform === "darwin") dataPath = join(app.getPath("userData"), "..");
else dataPath = process.env.XDG_CONFIG_HOME ? process.env.XDG_CONFIG_HOME : join(process.env.HOME || "", ".config"); // This will help with snap packages eventually
dataPath = join(dataPath, "Colorish") + "/";

class Contexts<Context extends object> {
    contexts: Context;
    unsavedContexts: string[];
    constructor(contexts: Context, unsavedContexts: string[]) {
        this.contexts = contexts;
        this.unsavedContexts = unsavedContexts;

        if (!fs.existsSync(dataPath)) fs.mkdirSync(dataPath);

        const dataFiles = fs.readdirSync(dataPath).filter(f => !fs.statSync(resolve(dataPath, f)).isDirectory() && f === "settings.json");
        for (const file of dataFiles) {
            let data = {};
            try {
                const dt = readFileSync(resolve(dataPath, file)).toString();
                data = dt;
            }
            catch (e) { console.error("DataStore", `Could not load file ${file}`, e); }
            if (Object.keys(this.contexts).includes(file.split(".")[0])) {
                if (file.split(".")[0] === "version" && (this.contexts as any).version !== data) {
                    fs.writeFileSync(resolve(dataPath, `settings.json`), JSON.stringify(getFiltered(contexts, ...this.unsavedContexts), null, 4));
                } else this.contexts[file.split(".")[0]] = data;
            };
        }
    }

    setContext<Key extends keyof Context>(context: Key, value: Context[Key]): Context[Key] {
        this.contexts[context] = value;
        ipcMain.emit("COLORWAYS_CONTEXT_UPDATED", {
            c: context,
            value: value,
            contexts
        });
        fs.writeFileSync(resolve(dataPath, `settings.json`), JSON.stringify(getFiltered(contexts, ...this.unsavedContexts), null, 4));
        return value;
    }

    setContexts<C extends keyof Context>(...conts: ([C, Context[C]])[]) {
        conts.forEach(context => this.setContext(context[0], context[1]));
    }

    async initContexts() {
        const responses: Response[] = await Promise.all(
            (this.contexts as any).colorwaySourceFiles.map(source =>
                fetch(source.url)
            )
        );

        (this.contexts as any).colorwayData = await Promise.all(
            responses
                .map((res, i) => ({ response: res, name: (this.contexts as any).colorwaySourceFiles[i].name }))
                .map(({ response, name }: { response: Response, name: string; }) =>
                    response
                        .json()
                        .then(dt => ({
                            colorways: (dt.colorways || []), presets: (dt.presets || [] as Preset[]), source: name, type: "online"
                        }))
                        .catch(() => ({ colorways: [] as Colorway[], presets: [] as Preset[], source: name, type: "online" }))
                )
        ) as { type: "online" | "offline", source: string, colorways: Colorway[]; }[];

        Object.keys(this.contexts).forEach(c => {
            ipcMain.emit("COLORWAYS_CONTEXT_UPDATED", {
                c,
                value: this.contexts[c],
                contexts: this.contexts
            });
        });

        return this.contexts;
    }
}

export const { contexts, setContext, setContexts, initContexts } = new Contexts<{
    colorwaySourceFiles: { name: string, url: string; }[],
    customColorways: { name: string, colorways?: Colorway[], presets?: Preset[]; }[],
    activeColorwayObject: ColorwayObject,
    activeAutoPreset: string,
    colorwayData: SourceObject[],
    colorwayUsageMetrics: (ColorwayObject & { uses: number; })[],
    MID: string,
    version: string;
    colorwaysAppTheme: "light" | "dark";
}>({
    colorwaySourceFiles: [],
    customColorways: [],
    activeColorwayObject: nullColorwayObj,
    activeAutoPreset: "hueRotation",
    colorwayData: [],
    colorwayUsageMetrics: [],
    MID: "00000000",
    version: "2.0.0",
    colorwaysAppTheme: "dark"
}, ["colorwayData"]);
