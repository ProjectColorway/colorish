import { app } from "electron";
import fs, { readFileSync } from "node:fs";
import { join, resolve } from "path";
let dataPath = "";
if (process.platform === "win32" || process.platform === "darwin") dataPath = join(app.getPath("userData"), "..");
else dataPath = process.env.XDG_CONFIG_HOME ? process.env.XDG_CONFIG_HOME : join(process.env.HOME || "", ".config"); // This will help with snap packages eventually
dataPath = join(dataPath, "Colorish") + "/";
export default new class DataStore {
    data = {};

    async initialize() {
        if (!fs.existsSync(dataPath)) fs.mkdirSync(dataPath);

        const dataFiles = fs.readdirSync(dataPath).filter(f => !fs.statSync(resolve(dataPath, f)).isDirectory() && f === "settings.json");
        for (const file of dataFiles) {
            let data = {};
            try {
                const dt = readFileSync(resolve(dataPath, file)).toString();
                data = dt;
            }
            catch (e) { console.error("DataStore", `Could not load file ${file}`, e); }
            this.data[file.split(".")[0]] = data;
        }
    }

    get(key: string): any {
        return this.data[key] || undefined;
    }

    getMany(keys: string[]): any[] {
        return keys.map(key => this.data[key] || undefined);
    }

    getManyNamed(keys: string[]): [string, any][] {
        return keys.map(key => ([key, this.data[key] || undefined]));
    }

    set(key: string, value: any): void {
        this.data[key] = value;
        fs.writeFileSync(resolve(dataPath, `settings.json`), JSON.stringify(this.data, null, 4));
    }

    setMany(entries: [string, any][]): void {
        entries.forEach(([key, value]) => this.data[key] = value);
        fs.writeFileSync(resolve(dataPath, `settings.json`), JSON.stringify(this.data, null, 4));
    }
};
