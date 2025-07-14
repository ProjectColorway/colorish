import { DataStore, Dispatcher, Logger, Manager } from "@api/index";
import openChangelogModal from "@components/Modals/openChangelogModal";
import { nullColorwayObj } from "@renderer/constants";
import { Colorway, ColorwayObject, Context, ContextKey, Preset, SourceObject } from "@renderer/types";

export const contexts: {
    colorwaySourceFiles: { name: string, url: string; }[],
    customColorways: { name: string, colorways?: Colorway[], presets?: Preset[]; }[],
    activeColorwayObject: ColorwayObject,
    activeAutoPreset: string,
    colorwayData: SourceObject[],
    colorwayUsageMetrics: (ColorwayObject & { uses: number; })[],
    colorwaysManagerDoAutoconnect: boolean,
    colorwaysManagerAutoconnectPeriod: number,
    hasManagerRole: boolean,
    isConnected: boolean,
    boundKey: { [managerKey: string]: string; },
    colorwaysBoundManagers: { [managerKey: string]: string; }[];
    discordColorwaysData: {
        version: string,
        UIVersion: string;
    };
    colorwaysAppTheme: "light" | "dark" | "black";
    connectedApps: WsClient[];
    authedUser: {
        username: string | null,
        image: string | null;
    };
} = {
    colorwaySourceFiles: [],
    customColorways: [],
    activeColorwayObject: nullColorwayObj,
    activeAutoPreset: "hueRotation",
    colorwayData: [],
    colorwayUsageMetrics: [],
    colorwaysManagerDoAutoconnect: true,
    colorwaysManagerAutoconnectPeriod: 3000,
    hasManagerRole: false,
    isConnected: false,
    boundKey: {
        "00000000": `discord.${Math.random().toString(16).slice(2)}.${new Date().getUTCMilliseconds()}`
    },
    colorwaysBoundManagers: [],
    discordColorwaysData: {
        version: "2.0.0-beta2",
        UIVersion: "3.0.0"
    },
    colorwaysAppTheme: "dark",
    connectedApps: [],
    authedUser: {
        username: null,
        image: null
    }
};

export const unsavedContexts = ["themePresets", "isConnected", "boundKey", "hasManagerRole", "colorwayData", "connectedApps"];

const contextKeys: ContextKey[] = (Object.keys(contexts) as ContextKey[]).filter((key: ContextKey) => unsavedContexts.includes(key) === false);

export async function initContexts() {
    const data = await DataStore.getManyNamed(contextKeys);

    const logger = new Logger("ContextAPI");

    contexts.connectedApps = ((window as any).dc_win ? dc_win.getWsClients() : []);

    data.forEach(async ([key, value]) => {
        if (value === undefined) {
            DataStore.set(key, contexts[String(key)]);
            if (key === "discordColorwaysData") openChangelogModal();
        } else {
            if (key === "discordColorwaysData" && (value.version !== contexts.discordColorwaysData.version)) {
                await DataStore.set(key, { ...value, version: contexts.discordColorwaysData.version });
                openChangelogModal();
            } else contexts[String(key)] = value;
        }
    });

    const responses: ({ appId: string, appName: string, url: string, name: string, response: Response; })[] = await Promise.all(
        ([
            ...contexts.colorwaySourceFiles.map(s => ({ ...s, appId: "this-manager", appName: "This Manager" })),
            ...contexts.connectedApps.filter(source => !contexts.colorwaySourceFiles.map(s => s.url).includes(source.url)).map(app => app.online.map(s => ({ ...s, appId: Object.values(app.boundKey)[0], appName: Manager.getClientDisplayName(Object.values(app.boundKey)[0] as string) }))).flat().map(s => ({ name: s.name, url: s.url, appName: s.appName, appId: s.appId } as { appId: string, appName: string, url: string, name: string; }))
        ] as { appId: string, appName: string, url: string, name: string; }[]).map(async source => {
            try {
                const data = await fetch(source.url);
                return { ...source, response: data };
            } catch (e) {
                logger.warn(e);
                return { ...source, response: new Response() };
            }
        })
    );

    contexts.colorwayData = await Promise.all(
        responses.map(async res => {
            try {
                const json = await res.response.json();
                return { type: "online", source: res?.name, colorways: json.colorways, appName: res?.appName, appId: res?.appId };
            } catch (e) {
                logger.warn(e);
                return { type: "online", source: res?.name, colorways: [], appName: res?.appName, appId: res?.appId };
            }
        })
    ) as { type: "online" | "offline", source: string, colorways: Colorway[], appName: string, appId: string; }[];

    Object.keys(contexts).forEach(c => {
        Dispatcher.emit("COLORWAYS_CONTEXT_UPDATED", {
            c,
            value: contexts[c],
            contexts
        });
    });

    return contexts;
}

export function setContext<C extends keyof typeof contexts>(context: C, value: typeof contexts[C], save = true): typeof contexts[C] {
    contexts[context] = value as never;
    Dispatcher.emit("COLORWAYS_CONTEXT_UPDATED", {
        c: context,
        value: value,
        contexts
    });
    save && DataStore.set(context, value);
    return value;
}

export function setContexts<C extends ContextKey>(...conts: ([C, Context<C>] | [C, Context<C>, boolean])[]) {
    conts.forEach(context => {
        if (context[2]) {
            setContext(context[0], context[1], context[2]);
        }
    });
}
