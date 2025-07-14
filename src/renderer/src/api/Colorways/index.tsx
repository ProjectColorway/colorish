import { setContext } from "@api/Contexts";
import { simpleContexts } from "@api/Hooks";
import { Logger, Manager } from "@api/index";

export function compareColorwayObjects(obj1: ColorwayObject, obj2: ColorwayObject) {
    return obj1.id === obj2.id &&
        obj1.source === obj2.source &&
        obj1.sourceType === obj2.sourceType &&
        obj1.colors.accent === obj2.colors.accent &&
        obj1.colors.primary === obj2.colors.primary &&
        obj1.colors.secondary === obj2.colors.secondary &&
        obj1.colors.tertiary === obj2.colors.tertiary;
}

export async function updateColorwayData() {
    const [contexts, destroyContexts] = simpleContexts();
    const logger = new Logger("ColorwayDataAPI");

    const responses: ({ appId: string, appName: string, url: string, name: string, response: Response; })[] = await Promise.all(
        ([
            ...contexts().colorwaySourceFiles.map(s => ({ ...s, appId: "this-manager", appName: "This Manager" })),
            ...contexts().connectedApps.filter(source => !contexts().colorwaySourceFiles.map(s => s.url).includes(source.url)).map(app => app.online.map(s => ({ ...s, appId: Object.values(app.boundKey)[0], appName: Manager.getClientDisplayName(Object.values(app.boundKey)[0] as string) }))).flat().map(s => ({ name: s.name, url: s.url, appName: s.appName, appId: s.appId } as { appId: string, appName: string, url: string, name: string; }))
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

    setContext("colorwayData", await Promise.all(
        responses.map(async res => {
            try {
                const json = await res.response.json();
                return { type: "online", source: res?.name, colorways: json.colorways, appName: res?.appName, appId: res?.appId };
            } catch (e) {
                logger.warn(e);
                return { type: "online", source: res?.name, colorways: [], appName: res?.appName, appId: res?.appId };
            }
        })
    ) as SourceObject[]);

    return destroyContexts();
}
