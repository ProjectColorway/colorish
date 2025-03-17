import * as $Contexts from "./Contexts";
import * as $DataStore from "./DataStore";
import { dispatch } from "./Dispatcher";
import * as $ExpressionParser from "./ExpressionsParser";
import * as $Hooks from "./Hooks";
import * as $Styles from "./Styles";
import * as $Fs from "./Fs";
import * as $Colors from "./Colors";
import * as $Manager from "./Manager";
import * as $Modals from "./Modals";

export const Manager = $Manager;
export const DataStore = $DataStore;
export const Styles = $Styles;
export const Dispatcher = dispatch;
export const Contexts = $Contexts;
export const Hooks = $Hooks;
export const Fs = $Fs;
export const ExpressionParser = $ExpressionParser;
export const Colors = $Colors;
export const Modals = $Modals;

export function classes(...classes: Array<string | null | undefined | false>) {
    return classes.filter(Boolean).join(" ");
}

export class Logger {
    static makeTitle(color: string, title: string): [string, ...string[]] {
        return ["%c %c %s ", "", `background: ${color}; color: black; font-weight: bold; border-radius: 5px;`, title];
    }

    constructor(public name: string) { }

    private _log(level: "log" | "error" | "warn" | "info" | "debug", _: string, args: any[]) {
        console[level](
            `%c DiscordColorways %c %c ${this.name} %c`,
            "background-color: #5865f2; color: #fff; font-family: 'gg sans', 'Noto Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 0 4px; border-radius: 4px;",
            "",
            "background-color: #5865f2; color: #fff; font-family: 'gg sans', 'Noto Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 0 4px; border-radius: 4px;",
            "",
            ...args
        );
    }

    public log(...args: any[]) {
        this._log("log", "#a6d189", args);
    }

    public info(...args: any[]) {
        this._log("info", "#a6d189", args);
    }

    public error(...args: any[]) {
        this._log("error", "#e78284", args);
    }

    public warn(...args: any[]) {
        this._log("warn", "#e5c890", args);
    }

    public debug(...args: any[]) {
        this._log("debug", "#eebebe", args);
    }
}

export function compareColorwayObjects(obj1: ColorwayObject, obj2: ColorwayObject) {
    return obj1.id === obj2.id &&
        obj1.source === obj2.source &&
        obj1.sourceType === obj2.sourceType &&
        obj1.colors.accent === obj2.colors.accent &&
        obj1.colors.primary === obj2.colors.primary &&
        obj1.colors.secondary === obj2.colors.secondary &&
        obj1.colors.tertiary === obj2.colors.tertiary;
}

export const stringToHex = (str: string) => {
    let hex = "";
    for (
        let i = 0;
        i < str.length;
        i++
    ) {
        const charCode = str.charCodeAt(i);
        const hexValue = charCode.toString(16);
        hex += hexValue.padStart(2, "0");
    }
    return hex;
};

export function guidGenerator() {
    var S4 = function () {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };
    return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}
