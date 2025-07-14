/* eslint-disable no-unsafe-optional-chaining */
import { Colors, Contexts, Dispatcher, Hooks, Manager } from "@renderer/api";
import { colorToHex } from "@renderer/api/Colors";
import { compareColorwayObjects } from "@renderer/api/Colorways";
import { setSearchOpen } from "@renderer/api/GlobalSearch";
import { nullColorwayObj } from "@renderer/constants";
import { useCallback, useEffect, useState } from "react";

import { ColorwayObject } from "../../types";

export default function ({ page }: { page?: { placeholder: string, index: number; }; }) {
    const [isVisible, setIsVisible] = useState(false);
    const contexts = Hooks.useContexts();
    const [val, setVal] = useState("");

    useEffect(() => {
        Dispatcher.addListener("SET_GS_OPEN", ({ open }) => setIsVisible(open));

        return () => {
            Dispatcher.removeListener("SET_GS_OPEN", ({ open }) => setIsVisible(open));
        };
    }, []);

    const colorways = Hooks.useCustomContext(({ colorwayData, customColorways }) => [
        {
            name: "All",
            id: "all",
            sources: [...colorwayData, ...customColorways.map(source => ({ source: source.name, colorways: source.colorways, type: "offline" }))]
        }
    ].map(source => source.sources)
        .map(source => source.map(({ colorways, source, type }) => (colorways || []).map(color => ({ ...color, sourceType: type, source })))).flat(2).filter(({ name }) => name.toLowerCase().includes(val.toLowerCase())).slice(0, 5));

    const openGlobalSearch = useCallback(function openGlobalSearch(e: KeyboardEvent) {
        if (e.code === "Escape") {
            e.preventDefault();
            setSearchOpen(false);
            setVal("");
        }
    }, []);

    useEffect(() => {
        window.addEventListener("keydown", openGlobalSearch);
        window.document.addEventListener("click", () => {
            setSearchOpen(false);
            setVal("");
        });

        return () => {
            window.document.removeEventListener("click", () => {
                setSearchOpen(false);
                setVal("");
            });
            window.removeEventListener("keydown", openGlobalSearch);
        };
    }, []);

    return <>
        {isVisible && <div className="shadow-2xl shadow-primary-800 m-0 p-0 !bg-primary-400 !fixed bottom-2 left-1/2 -translate-x-1/2 w-[calc(100vw-16px)] z-1000 !rounded-3xl !pb-0 !animate-gs-modal transition-all duration-400 origin-center" onClick={e => e.stopPropagation()}>
            <div className="dc-modal-content !p-2 w-full !max-w-[unset] !gap-0.5">
                <input onChange={e => setVal(e.currentTarget.value)} type="text" className={"dc-textbox p-6 placeholder-shown:text-center placeholder-shown:caret-transparent !rounded-2xl" + (val ? " !rounded-b-sm" : "")} autoFocus placeholder={page ? page.placeholder : "Search for anything..."} />
                {val && <>
                    <div className="flex flex-col gap-0.5 *:!w-full">
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
                                return <div
                                    className="colorway-pure rounded-sm last-of-type:rounded-b-2xl"
                                    id={"colorway-" + color.name}
                                    key={i}
                                    aria-checked={contexts.activeColorwayObject.id === color.name && contexts.activeColorwayObject.source === color.source}
                                    onClick={() => selectColorway()}
                                    role="button"
                                >
                                    <div className="dc-color-swatch">
                                        {Object.values({
                                            accent: color.accent,
                                            primary: color.primary,
                                            secondary: color.secondary,
                                            tertiary: color.tertiary
                                        }).map((colorStr, i) => <div
                                            key={i}
                                            className="dc-color-swatch-part"
                                            style={{ backgroundColor: `#${colorToHex(colorStr)}` }} />)}
                                    </div>
                                    <div className="dc-label-wrapper">
                                        <span className="dc-label">{color.name}</span>
                                        <span className="dc-label dc-subnote dc-note">by {color.author} • from {color.source}</span>
                                    </div>
                                </div>;
                            })}
                    </div>
                </>}
            </div>
        </div>}
        <div className={`bg-black/50 h-screen w-screen fixed top-0 left-0 transition-all ease duration-300 z-999 opacity-0 ${isVisible ? " !opacity-100" : " pointer-events-none"}`} />
    </>;
}
