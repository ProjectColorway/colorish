import { useContext, useEffect, useState } from "react";
import { Contexts, Hooks, Manager, compareColorwayObjects, Colors } from "@renderer/api";
import { ColorwayObject } from "../../types";
import { setSearchOpen } from "@renderer/App";
import { nullColorwayObj } from "@renderer/constants";
import { DeleteIcon, DownloadIcon } from "../Icons";
import ColorwayItem from "../Colorway";
import { OnlineSourceMeta } from "../SettingsTabs/SourceManager";
import { GlobalSearchContext } from "@renderer/contexts";

export default function ({ page }: { page?: { placeholder: string, index: number; }; }) {
    const isVisible = useContext(GlobalSearchContext);
    const contexts = Hooks.useContexts();
    const [val, setVal] = useState("");
    const [invalidColorwayClicked] = Hooks.useTimedState<string>("", 2000);
    const [active, setActive] = useState(page ? page.index : 0);
    const [selected, setSelected] = useState(0);
    const [storeObject, setStoreObject] = useState<StoreItem[]>([]);

    const colorways = Hooks.useCustomContext(({ colorwayData, customColorways }) => [
        {
            name: "All",
            id: "all",
            sources: [...colorwayData, ...customColorways.map(source => ({ source: source.name, colorways: source.colorways, type: "offline" }))]
        }
    ].map(source => source.sources)
        .map(source => source.map(({ colorways, source, type }) => (colorways || []).map(color => ({ ...color, sourceType: type, source })))).flat(2).filter(({ name }) => name.toLowerCase().includes(val.toLowerCase())).slice(0, 5));

    const sources = Hooks.useCustomContext(({ colorwaySourceFiles, customColorways }) => [
        ...colorwaySourceFiles.map(src => ({ ...src, type: "online" })) as { name: string, url: string, type: "online"; }[],
        ...customColorways.map(src => ({ ...src, type: "offline" })) as { name: string, colorways: Colorway[], type: "offline"; }[]
    ].filter(src => src.name.toLowerCase().includes(val.toLowerCase()))
        .slice(0, 5));

    const metrics = Hooks.useCustomContext(({ colorwayUsageMetrics }) => colorwayUsageMetrics.filter(({ id }) => id?.toLowerCase().includes(val.toLowerCase())).slice(0, 5));

    const storeSources = storeObject.filter(({ id }) => id?.toLowerCase().includes(val.toLowerCase())).slice(0, 5);

    async function setOnline(obj: { name: string, url: string; }, action: "add" | "remove") {
        if (action === "add") {
            Contexts.setContext("colorwaySourceFiles", [...contexts.colorwaySourceFiles, obj]);
        }
        if (action === "remove") {
            Contexts.setContext("colorwaySourceFiles", contexts.colorwaySourceFiles.filter(src => src.name !== obj.name && src.url !== obj.url));
        }

        const responses: ({ appId: string, appName: string, url: string, name: string, response: Response; })[] = await Promise.all(
            ([
                ...contexts.colorwaySourceFiles.map(s => ({ ...s, appId: "this-manager", appName: "This Manager" })),
                ...contexts.connectedApps.filter(source => !contexts.colorwaySourceFiles.map(s => s.url).includes(source.url)).map(app => app.online.map(s => ({ ...s, appId: Object.values(app.boundKey)[0], appName: Manager.getClientDisplayName(Object.values(app.boundKey)[0] as string) }))).flat().map(s => ({ name: s.name, url: s.url, appName: s.appName, appId: s.appId } as { appId: string, appName: string, url: string, name: string; }))
            ] as { appId: string, appName: string, url: string, name: string; }[]).map(async source => ({ ...source, response: await fetch(source.url) }))
        );

        Contexts.setContext("colorwayData", await Promise.all(
            responses.map(async res => ({ type: "online", source: res?.name, colorways: (await res?.response.json()).colorways, appName: res?.appName, appId: res?.appId }))
        ) as { type: "online" | "offline", source: string, colorways: Colorway[], appName: string, appId: string; }[], false);
    }

    useEffect(() => {
        (async function () {
            const res: Response = await fetch("https://www.dablulite.dev/api/colorways/sources");
            const data = await res.json();
            setStoreObject(data.sources);
        })();
    }, []);

    useEffect(() => {
        function openGlobalSearch(e: KeyboardEvent) {
            if (e.code === 'Escape') {
                e.preventDefault();
                setSearchOpen(false);
            }
            if (e.ctrlKey && e.code === 'KeyK') {
                e.preventDefault();
                setSearchOpen(true);
            }
            if (e.ctrlKey && e.code === 'Tab') {
                e.preventDefault();
                setSelected(0);
                !page && setActive(act => {
                    if (act + 1 > 3) return 0;
                    return act + 1;
                });
            }
            if (e.code === 'ArrowDown') {
                e.preventDefault();
                const max = (() => {
                    if (active === 0) return colorways.length - 1;
                    if (active === 1) return sources.length - 1;
                    if (active === 2) return metrics.length - 1;
                    return storeSources.length - 1;
                })();
                setSelected(act => {
                    if (act + 1 > max) return 0;
                    return act + 1;
                });
            }
            if (e.code === 'ArrowUp') {
                e.preventDefault();
                const max = (() => {
                    if (active === 0) return colorways.length - 1;
                    if (active === 1) return sources.length - 1;
                    if (active === 2) return metrics.length - 1;
                    return storeSources.length - 1;
                })();
                setSelected(act => {
                    if (act - 1 < 0) return max;
                    return act - 1;
                });
            }
            if (e.code === 'Enter' && active === 0) {
                e.preventDefault();
                (async () => {
                    if (contexts.activeColorwayObject.id === colorways[selected].name && contexts.activeColorwayObject.source === colorways[selected].source) {
                        Contexts.setContext("activeColorwayObject", nullColorwayObj);

                        Manager.removeColorway();
                    } else {
                        const newObj: ColorwayObject = {
                            id: colorways[selected].name,
                            sourceType: colorways[selected].sourceType as Colorway["sourceType"],
                            source: colorways[selected].source,
                            colors: {} as ColorwayObject["colors"]
                        };
                        colorways[selected].accent ? (newObj.colors.accent = "#" + Colors.colorToHex(colorways[selected].accent)) : void 0;
                        colorways[selected].primary ? (newObj.colors.primary = "#" + Colors.colorToHex(colorways[selected].primary)) : void 0;
                        colorways[selected].secondary ? (newObj.colors.secondary = "#" + Colors.colorToHex(colorways[selected].secondary)) : void 0;
                        colorways[selected].tertiary ? (newObj.colors.tertiary = "#" + Colors.colorToHex(colorways[selected].tertiary)) : void 0;
                        colorways[selected].linearGradient ? (newObj.linearGradient = colorways[selected].linearGradient) : void 0;

                        Manager.sendColorway(newObj);

                        Contexts.setContext("activeColorwayObject", newObj);

                        if (contexts.colorwayUsageMetrics.filter(metric => compareColorwayObjects(metric, newObj)).length) {
                            Contexts.setContext("colorwayUsageMetrics", contexts.colorwayUsageMetrics.map(metric => {
                                if (compareColorwayObjects(metric, newObj)) {
                                    return { ...metric, uses: metric.uses + 1 };
                                }
                                return metric;
                            }));
                        } else {
                            Contexts.setContext("colorwayUsageMetrics", [...contexts.colorwayUsageMetrics, { ...newObj, uses: 1 }]);
                        }
                    }
                })();
            }
            if (e.code === 'Enter') {
                e.preventDefault();
                if (active === 3) {
                    if (contexts.colorwaySourceFiles.map(source => source.name).includes(storeSources[selected].name)) {
                        setOnline({ name: storeSources[selected].name, url: storeSources[selected].url as string }, "remove");
                    } else {
                        setOnline({ name: storeSources[selected].name, url: storeSources[selected].url as string }, "add");
                    }
                }
                if (active === 0) {
                    (async () => {
                        if (contexts.activeColorwayObject.id === colorways[selected].name && contexts.activeColorwayObject.source === colorways[selected].source) {
                            Contexts.setContext("activeColorwayObject", nullColorwayObj);

                            Manager.removeColorway();
                        } else {
                            const newObj: ColorwayObject = {
                                id: colorways[selected].name,
                                sourceType: colorways[selected].sourceType as Colorway["sourceType"],
                                source: colorways[selected].source,
                                colors: {} as ColorwayObject["colors"]
                            };
                            colorways[selected].accent ? (newObj.colors.accent = "#" + Colors.colorToHex(colorways[selected].accent)) : void 0;
                            colorways[selected].primary ? (newObj.colors.primary = "#" + Colors.colorToHex(colorways[selected].primary)) : void 0;
                            colorways[selected].secondary ? (newObj.colors.secondary = "#" + Colors.colorToHex(colorways[selected].secondary)) : void 0;
                            colorways[selected].tertiary ? (newObj.colors.tertiary = "#" + Colors.colorToHex(colorways[selected].tertiary)) : void 0;
                            colorways[selected].linearGradient ? (newObj.linearGradient = colorways[selected].linearGradient) : void 0;

                            Manager.sendColorway(newObj);

                            Contexts.setContext("activeColorwayObject", newObj);

                            if (contexts.colorwayUsageMetrics.filter(metric => compareColorwayObjects(metric, newObj)).length) {
                                Contexts.setContext("colorwayUsageMetrics", contexts.colorwayUsageMetrics.map(metric => {
                                    if (compareColorwayObjects(metric, newObj)) {
                                        return { ...metric, uses: metric.uses + 1 };
                                    }
                                    return metric;
                                }));
                            } else {
                                Contexts.setContext("colorwayUsageMetrics", [...contexts.colorwayUsageMetrics, { ...newObj, uses: 1 }]);
                            }
                        }
                    })();
                }
            }
        }
        window.addEventListener("keydown", openGlobalSearch);

        return () => {
            window.removeEventListener("keydown", openGlobalSearch);
        };
    }, [selected, active]);

    return <>
        {isVisible && <div className="dc-modal removing:close-modal !fixed top-4 left-1/2 -translate-x-1/2 z-1000" onClick={e => e.stopPropagation()}>
            <div className="dc-modal-content !p-2" style={{ minWidth: "500px" }}>
                <input onChange={(e) => setVal(e.currentTarget.value)} type="text" className="dc-textbox p-6 placeholder-shown:text-center placeholder-shown:caret-transparent" autoFocus placeholder={page ? page.placeholder : "Search for anything..."} />
                {val && <>
                    {!page && <div className="flex gap-1 items-center my-1">
                        <div className={`dc-button ${active === 0 ? "dc-button-brand" : ""}`} onClick={() => setActive(0)}>Colorways</div>
                        <div className={`dc-button ${active === 1 ? "dc-button-brand" : ""}`} onClick={() => setActive(1)}>Sources</div>
                        <div className={`dc-button ${active === 2 ? "dc-button-brand" : ""}`} onClick={() => setActive(2)}>History</div>
                        <div className={`dc-button ${active === 3 ? "dc-button-brand" : ""}`} onClick={() => setActive(3)}>Store</div>
                    </div>}
                    {(active === 0) && <div className="flex flex-col gap-1 *:!rounded-lg *:!w-full">
                        {colorways
                            .map((color, i) => {
                                async function selectColorway() {
                                    if (contexts.activeColorwayObject.id === color.name && contexts.activeColorwayObject.source === color.source) {
                                        Contexts.setContext("activeColorwayObject", nullColorwayObj);

                                        Manager.removeColorway();
                                    } else {
                                        const newObj: ColorwayObject = {
                                            id: color.name,
                                            sourceType: color.sourceType as Colorway["sourceType"],
                                            source: color.source,
                                            colors: {} as ColorwayObject["colors"]
                                        };
                                        color.accent ? (newObj.colors.accent = "#" + Colors.colorToHex(color.accent)) : void 0;
                                        color.primary ? (newObj.colors.primary = "#" + Colors.colorToHex(color.primary)) : void 0;
                                        color.secondary ? (newObj.colors.secondary = "#" + Colors.colorToHex(color.secondary)) : void 0;
                                        color.tertiary ? (newObj.colors.tertiary = "#" + Colors.colorToHex(color.tertiary)) : void 0;
                                        color.linearGradient ? (newObj.linearGradient = color.linearGradient) : void 0;

                                        Manager.sendColorway(newObj);

                                        Contexts.setContext("activeColorwayObject", newObj);

                                        if (contexts.colorwayUsageMetrics.filter(metric => compareColorwayObjects(metric, newObj)).length) {
                                            Contexts.setContext("colorwayUsageMetrics", contexts.colorwayUsageMetrics.map(metric => {
                                                if (compareColorwayObjects(metric, newObj)) {
                                                    return { ...metric, uses: metric.uses + 1 };
                                                }
                                                return metric;
                                            }));
                                        } else {
                                            Contexts.setContext("colorwayUsageMetrics", [...contexts.colorwayUsageMetrics, { ...newObj, uses: 1 }]);
                                        }
                                    }
                                }
                                return <ColorwayItem
                                    id={"colorway-" + color.name}
                                    key={i}
                                    data-focus={i === selected}
                                    aria-invalid={invalidColorwayClicked === "colorway-" + color.name}
                                    aria-checked={contexts.activeColorwayObject.id === color.name && contexts.activeColorwayObject.source === color.source}
                                    onClick={() => selectColorway()}
                                    colors={Object.values({
                                        accent: color.accent,
                                        primary: color.primary,
                                        secondary: color.secondary,
                                        tertiary: color.tertiary
                                    })}
                                    text={color.name}
                                    descriptions={[`by ${color.author}`, `from ${color.source}`]}
                                />;
                            })}
                    </div>}
                    {(active === 1) && <div className="flex flex-col gap-1 *:!rounded-lg *:!w-full">
                        {sources
                            .map((src: ({ name: string; } & ({ colorways?: Colorway[], presets?: Preset[], type: "offline"; } | { type: "online", url: string; })), i) => {
                                return <div
                                    className="dc-colorway [[data-focus='true']]:!border [[data-focus='true']]:!border-black [[data-focus='true']]:dark:!border-primary-300"
                                    data-focus={i === selected}
                                    style={{ cursor: "default" }}
                                    id={"colorwaySource" + src.name}
                                    key={i}
                                >
                                    <div className="dc-label-wrapper">
                                        <span className="dc-label">{src.name}</span>
                                        {src.type === "online" ? <span className="dc-label dc-subnote dc-note">Online • <OnlineSourceMeta source={src.url} onComplete={({ colorways, presets }) => `${(colorways || []).length} colorways • ${(presets || []).length} presets`} /></span> : <span className="dc-label dc-subnote dc-note">Offline • {(src.colorways || []).length} colorways • {(src.presets || []).length} presets</span>}
                                    </div>
                                </div>;
                            })}
                    </div>}
                    {(active === 2) && <div className="flex flex-col gap-1 *:!rounded-lg *:!w-full">
                        {metrics.map((color, i) => <div
                            className="dc-colorway [[data-focus='true']]:!border [[data-focus='true']]:!border-black [[data-focus='true']]:dark:!border-primary-300"
                            key={i}
                            data-focus={i === selected}
                        >
                            <div className="dc-label-wrapper">
                                <span className="dc-label">{color.id}</span>
                                <span className="dc-label dc-subnote dc-note">in {color.source} • {color.uses} uses</span>
                            </div>
                        </div>)}
                    </div>}
                    {(active === 3) && <div className="flex flex-col gap-1 *:!rounded-lg *:!w-full">
                        {storeSources.map((item, i) => <div
                            className="dc-colorway [[data-focus='true']]:!border [[data-focus='true']]:!border-black [[data-focus='true']]:dark:!border-primary-300"
                            key={i}
                            style={{ cursor: "default" }}
                            id={"colorwaySource" + item.name}
                            data-focus={i === selected}
                        >
                            <div className="dc-label-wrapper">
                                <span className="dc-label">{item.name}</span>
                                <span className="dc-label dc-subnote dc-note">{item.description} • by {item.authorGh}</span>
                            </div>
                            <div style={{ marginRight: "auto" }} />
                            {contexts.colorwaySourceFiles.map(source => source.name).includes(item.name) ? <DeleteIcon width={16} height={16} /> : <DownloadIcon width={16} height={16} />}
                        </div>)}
                    </div>}
                </>}
            </div>
        </div>}
        <div className={`bg-linear-to-b from-primary-800 to-transparent h-20 w-screen fixed top-0 left-0 transition-all ease duration-300 z-999 opacity-0 pointer-events-none${isVisible ? " !opacity-100" : ""}`} />
    </>;
}
