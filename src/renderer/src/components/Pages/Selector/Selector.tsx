/* eslint-disable no-unsafe-optional-chaining */
import { Dispatcher, Manager, Parsers } from "@renderer/api";
import { colorToHex } from "@renderer/api/Colors";
import { compareColorwayObjects, updateColorwayData } from "@renderer/api/Colorways";
import { setContext } from "@renderer/api/Contexts";
import { useContexts, useTimedState } from "@renderer/api/Hooks";
import { openModal } from "@renderer/api/Modals";
import { showNotification } from "@renderer/api/Notifications";
import ColorwayItem from "@renderer/components/Colorway";
import { ContextMenuItem, StaticContextMenu } from "@renderer/components/ContextMenu";
import { DeleteIcon, IDIcon, PencilIcon, PlusIcon } from "@renderer/components/Icons";
import Modal from "@renderer/components/Modals/Modal";
import SaveColorwayAsModal from "@renderer/components/Modals/SaveColorwayAsModal";
import Radio from "@renderer/components/Radio";
import Spinner from "@renderer/components/Spinner";
import { nullColorwayObj } from "@renderer/constants";
import { getAutoPresets } from "@renderer/css";
import { SortOptions, SourceActions } from "@renderer/types";
import { useEffect, useState } from "react";

import get_updateCustomSource from "./get_updateCustomSource";

export default function Selector() {
    const [invalidColorwayClicked, setInvalidColorwayClicked] = useTimedState<string>("", 2000);
    const [sortBy, setSortBy] = useState<SortOptions>(SortOptions.MOST_USED);
    const [showSpinner, setShowSpinner] = useState<boolean>(false);
    const [visibleSources, setVisibleSources] = useState<string>("all");
    const contexts = useContexts();

    const updateCustomSource = get_updateCustomSource(contexts.customColorways, data => setContext("customColorways", data));

    const filters = [
        {
            name: "All",
            id: "all",
            appName: "All Sources",
            sources: [...contexts.colorwayData, ...contexts.customColorways.map(source => ({ source: source.name, colorways: source.colorways, type: "offline" }))]
        },
        ...contexts.colorwayData.map(source => ({
            name: source.source,
            appName: source.appName,
            id: source.source.toLowerCase().replaceAll(" ", "-"),
            sources: [source]
        })),
        ...contexts.customColorways.map(source => ({
            name: source.name,
            appName: "This Manager",
            id: source.name.toLowerCase().replaceAll(" ", "-"),
            sources: [{ source: source.name, colorways: source.colorways, type: "offline" }]
        })),
        ...contexts.connectedApps.map(app => app.offline.map(source => ({ appName: Manager.getClientDisplayName(Object.values(app.boundKey)[0] as string), name: source.name, id: source.name.toLowerCase().replaceAll(" ", "-"), sources: [source] }))).flat()
    ];

    useEffect(() => {
        async function reload(e: KeyboardEvent) {
            if (e.ctrlKey && e.code === "KeyR") {
                e.preventDefault();
                setShowSpinner(true);

                const responses: ({ appId: string, appName: string, url: string, name: string, response: Response; })[] = await Promise.all(
                    ([
                        ...contexts.colorwaySourceFiles.map(s => ({ ...s, appId: "this-manager", appName: "This Manager" })),
                        ...contexts.connectedApps.filter(source => !contexts.colorwaySourceFiles.map(s => s.url).includes(source.url)).map(app => app.online.map(s => ({ ...s, appId: Object.values(app.boundKey)[0], appName: Manager.getClientDisplayName(Object.values(app.boundKey)[0] as string) }))).flat().map(s => ({ name: s.name, url: s.url, appName: s.appName, appId: s.appId } as { appId: string, appName: string, url: string, name: string; }))
                    ] as { appId: string, appName: string, url: string, name: string; }[]).map(async source => ({ ...source, response: await fetch(source.url) }))
                );

                setContext("colorwayData", await Promise.all(
                    responses.map(async res => ({ type: "online", source: res?.name, colorways: (await res?.response.json()).colorways, appName: res?.appName, appId: res?.appId }))
                ) as { type: "online" | "offline", source: string, colorways: Colorway[], appName: string, appId: string; }[], false);

                setShowSpinner(false);
            }
        }

        window.addEventListener("keydown", reload);

        return () => {
            window.removeEventListener("keydown", reload);
        };
    }, []);

    return <>
        <div className="flex items-center gap-1">
            <button
                className="dc-button dc-button-primary dc-button-icon !rounded-full"
                onClick={async () => {
                    if (!showSpinner) {
                        setShowSpinner(true);

                        await updateColorwayData();

                        setShowSpinner(false);
                    }
                }}>
                {showSpinner ? <Spinner className="dc-selector-spinner size-5" /> : <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
                    <path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 0 1-9.201 2.466l-.312-.311h2.433a.75.75 0 0 0 0-1.5H3.989a.75.75 0 0 0-.75.75v4.242a.75.75 0 0 0 1.5 0v-2.43l.31.31a7 7 0 0 0 11.712-3.138.75.75 0 0 0-1.449-.39Zm1.23-3.723a.75.75 0 0 0 .219-.53V2.929a.75.75 0 0 0-1.5 0V5.36l-.31-.31A7 7 0 0 0 3.239 8.188a.75.75 0 1 0 1.448.389A5.5 5.5 0 0 1 13.89 6.11l.311.31h-2.432a.75.75 0 0 0 0 1.5h4.243a.75.75 0 0 0 .53-.219Z" clipRule="evenodd" />
                </svg>}
            </button>
            <StaticContextMenu
                xPos="left"
                menu={<>
                    <ContextMenuItem
                        onClick={() => openModal(props => <SaveColorwayAsModal modalProps={props} />)}
                    >
                        Add Colorway...
                        <PlusIcon className="size-5" style={{ boxSizing: "content-box" }} />
                    </ContextMenuItem>
                    <div className="dc-contextmenu-label">Source</div>
                    {filters.map(({ name, id, appName }, i: number) => {
                        return <ContextMenuItem key={i} onClick={() => setVisibleSources(id)}>
                            <div className="flex flex-col">
                                <span className="w-full text-sm text-start">{name}</span>
                                <span className="w-full text-primary-500 text-start dark:text-primary-300">from {appName}</span>
                            </div>
                            <Radio checked={visibleSources === id} style={{
                                marginLeft: "8px"
                            }} />
                        </ContextMenuItem>;
                    })}
                    <div className="dc-contextmenu-divider" />
                    <div className="dc-contextmenu-label">Sort By</div>
                    <ContextMenuItem onClick={() => setSortBy(9)}>
                        Most Used
                        <Radio checked={sortBy === 9} style={{
                            marginLeft: "8px"
                        }} />
                    </ContextMenuItem>
                    <ContextMenuItem onClick={() => setSortBy(10)}>
                        Least Used
                        <Radio checked={sortBy === 10} style={{
                            marginLeft: "8px"
                        }} />
                    </ContextMenuItem>
                    <ContextMenuItem onClick={() => setSortBy(1)}>
                        Name (A-Z)
                        <Radio checked={sortBy === 1} style={{
                            marginLeft: "8px"
                        }} />
                    </ContextMenuItem>
                    <ContextMenuItem onClick={() => setSortBy(2)}>
                        Name (Z-A)
                        <Radio checked={sortBy === 2} style={{
                            marginLeft: "8px"
                        }} />
                    </ContextMenuItem>
                    <ContextMenuItem onClick={() => setSortBy(3)}>
                        Source (A-Z)
                        <Radio checked={sortBy === 3} style={{
                            marginLeft: "8px"
                        }} />
                    </ContextMenuItem>
                    <ContextMenuItem onClick={() => setSortBy(4)}>
                        Source (Z-A)
                        <Radio checked={sortBy === 4} style={{
                            marginLeft: "8px"
                        }} />
                    </ContextMenuItem>
                    <ContextMenuItem onClick={() => setSortBy(5)}>
                        Source Type (Online First)
                        <Radio checked={sortBy === 5} style={{
                            marginLeft: "8px"
                        }} />
                    </ContextMenuItem>
                    <ContextMenuItem onClick={() => setSortBy(6)}>
                        Source Type (Offline First)
                        <Radio checked={sortBy === 6} style={{
                            marginLeft: "8px"
                        }} />
                    </ContextMenuItem>
                    <ContextMenuItem onClick={() => setSortBy(7)}>
                        Color Count (Ascending)
                        <Radio checked={sortBy === 7} style={{
                            marginLeft: "8px"
                        }} />
                    </ContextMenuItem>
                    <ContextMenuItem onClick={() => setSortBy(8)}>
                        Color Count (Descending)
                        <Radio checked={sortBy === 8} style={{
                            marginLeft: "8px"
                        }} />
                    </ContextMenuItem>
                </>}>
                {({ onClick, containerRef }) => <button
                    ref={containerRef}
                    className="dc-button dc-button-primary dc-button-icon !rounded-full"
                    onClick={onClick}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5">
                        <path d="M18.75 12.75h1.5a.75.75 0 0 0 0-1.5h-1.5a.75.75 0 0 0 0 1.5ZM12 6a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 12 6ZM12 18a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 12 18ZM3.75 6.75h1.5a.75.75 0 1 0 0-1.5h-1.5a.75.75 0 0 0 0 1.5ZM5.25 18.75h-1.5a.75.75 0 0 1 0-1.5h1.5a.75.75 0 0 1 0 1.5ZM3 12a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 3 12ZM9 3.75a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5ZM12.75 12a2.25 2.25 0 1 1 4.5 0 2.25 2.25 0 0 1-4.5 0ZM9 15.75a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Z" />
                    </svg>
                </button>}
            </StaticContextMenu>
        </div>
        <div className="dc-selector !grid-cols-1 use-scrollbar !max-h-[unset] pb-20">
            {(contexts.activeColorwayObject.sourceType === "temporary") && <div
                className="colorway-pure rounded-sm first-of-type:rounded-t-2xl last-of-type:rounded-b-2xl"
                id="colorway-Temporary"
                role="button"
                aria-checked={contexts.activeColorwayObject.sourceType === "temporary"}
                aria-invalid={invalidColorwayClicked === "colorway-Temporary"}
                onClick={async () => {
                    if (contexts.isConnected) {
                        if (!contexts.hasManagerRole) {
                            setInvalidColorwayClicked("colorway-Temporary");
                        } else {
                            setContext("activeColorwayObject", nullColorwayObj);
                        }
                    } else {
                        setContext("activeColorwayObject", nullColorwayObj);
                    }
                }}
            >
                <div className="dc-color-swatch">
                    <div
                        className="dc-color-swatch-part"
                        style={{ backgroundColor: "#" + contexts.activeColorwayObject.colors.accent }} />
                    <div
                        className="dc-color-swatch-part"
                        style={{ backgroundColor: "#" + contexts.activeColorwayObject.colors.primary }} />
                    <div
                        className="dc-color-swatch-part"
                        style={{ backgroundColor: "#" + contexts.activeColorwayObject.colors.secondary }} />
                    <div
                        className="dc-color-swatch-part"
                        style={{ backgroundColor: "#" + contexts.activeColorwayObject.colors.tertiary }} />
                </div>
                <div className="dc-label-wrapper">
                    <span className="dc-label">{contexts.activeColorwayObject.id}</span>
                    <span className="dc-label dc-subnote dc-note">Temporary Colorway</span>
                </div>
                <button
                    className="dc-button"
                    onClick={async e => {
                        e.stopPropagation();
                        openModal(props => <SaveColorwayAsModal
                            modalProps={props}
                            colorwayObject={contexts.activeColorwayObject}
                        />);
                    }}
                >
                    <PlusIcon width={20} height={20} />
                </button>
            </div>}
            {getComputedStyle(document.body).getPropertyValue("--os-accent-color") ? <ColorwayItem
                id="colorway-Auto"
                text="Auto Colorway"
                descriptions={[`Active preset: ${Object.values(getAutoPresets()).find(pr => pr.id === contexts.activeAutoPreset)?.name}`]}
                colors={[
                    getAutoPresets(colorToHex(getComputedStyle(document.body).getPropertyValue("--os-accent-color")).slice(0, 6))[contexts.activeAutoPreset].colors.accent,
                    getAutoPresets(colorToHex(getComputedStyle(document.body).getPropertyValue("--os-accent-color")).slice(0, 6))[contexts.activeAutoPreset].colors.primary,
                    getAutoPresets(colorToHex(getComputedStyle(document.body).getPropertyValue("--os-accent-color")).slice(0, 6))[contexts.activeAutoPreset].colors.secondary,
                    getAutoPresets(colorToHex(getComputedStyle(document.body).getPropertyValue("--os-accent-color")).slice(0, 6))[contexts.activeAutoPreset].colors.tertiary
                ]}
                aria-checked={contexts.activeColorwayObject.id === "Auto" && contexts.activeColorwayObject.sourceType === "auto"}
                aria-invalid={invalidColorwayClicked === "colorway-Auto"}
                onClick={async () => {
                    if (contexts.activeColorwayObject.id === "Auto" && contexts.activeColorwayObject.sourceType === "auto") {
                        setContext("activeColorwayObject", nullColorwayObj);

                        Manager.removeColorway();
                        showNotification("Disabled Auto Colorway");
                    } else {
                        const { colors } = getAutoPresets(colorToHex(getComputedStyle(document.body).getPropertyValue("--os-accent-color")).slice(0, 6))[contexts.activeAutoPreset];
                        const newObj: ColorwayObject = {
                            id: "Auto",
                            sourceType: "auto",
                            source: null,
                            colors: colors
                        };

                        setContext("activeColorwayObject", newObj);
                        Manager.sendColorway(newObj);

                        showNotification("Applied Auto Colorway");
                    }
                }}
            /> : <></>}
            {(filters
                .find(filter => filter.id === visibleSources) as { name: string, id: string, sources: SourceObject[]; } || { name: "null", id: "null", sources: [] }).sources
                .map(({ colorways, source, type }) => (colorways || []).map((colorway: Colorway) => ({ ...colorway, sourceType: type, source: source, preset: colorway.preset || (colorway.isGradient ? "Gradient" : "Default") })))
                .flat()
                .sort((a, b) => {
                    const objA = {
                        id: a.name,
                        source: a.source,
                        sourceType: a.sourceType,
                        colors: {}
                    } as ColorwayObject;
                    a.accent ? (objA.colors.accent = "#" + colorToHex(a.accent)) : void 0;
                    a.primary ? (objA.colors.primary = "#" + colorToHex(a.primary)) : void 0;
                    a.secondary ? (objA.colors.secondary = "#" + colorToHex(a.secondary)) : void 0;
                    a.tertiary ? (objA.colors.tertiary = "#" + colorToHex(a.tertiary)) : void 0;
                    const objB = {
                        id: b.name,
                        source: b.source,
                        sourceType: b.sourceType,
                        colors: {}
                    } as ColorwayObject;
                    b.accent ? (objB.colors.accent = "#" + colorToHex(b.accent)) : void 0;
                    b.primary ? (objB.colors.primary = "#" + colorToHex(b.primary)) : void 0;
                    b.secondary ? (objB.colors.secondary = "#" + colorToHex(b.secondary)) : void 0;
                    b.tertiary ? (objB.colors.tertiary = "#" + colorToHex(b.tertiary)) : void 0;
                    const aMetric = contexts.colorwayUsageMetrics.filter(metric => compareColorwayObjects(metric, objA))[0] || { ...objA, uses: 0 };
                    const bMetric = contexts.colorwayUsageMetrics.filter(metric => compareColorwayObjects(metric, objB))[0] || { ...objB, uses: 0 };
                    switch (sortBy) {
                        case SortOptions.NAME_AZ:
                            return a.name.localeCompare(b.name);
                        case SortOptions.NAME_ZA:
                            return b.name.localeCompare(a.name);
                        case SortOptions.SOURCE_AZ:
                            return a.source.localeCompare(b.source);
                        case SortOptions.SOURCE_ZA:
                            return b.source.localeCompare(a.source);
                        case SortOptions.SOURCETYPE_ONLINE:
                            return a.sourceType === "online" ? -1 : 1;
                        case SortOptions.SOURCETYPE_OFFLINE:
                            return a.sourceType === "offline" ? -1 : 1;
                        case SortOptions.COLORCOUNT_ASCENDING:
                            return (a.colors || [
                                "accent",
                                "primary",
                                "secondary",
                                "tertiary",
                            ]).length - (b.colors || [
                                "accent",
                                "primary",
                                "secondary",
                                "tertiary",
                            ]).length;
                        case SortOptions.COLORCOUNT_DESCENDING:
                            return (b.colors || [
                                "accent",
                                "primary",
                                "secondary",
                                "tertiary",
                            ]).length - (a.colors || [
                                "accent",
                                "primary",
                                "secondary",
                                "tertiary",
                            ]).length;
                        case SortOptions.MOST_USED:
                            if (aMetric.uses === bMetric.uses) {
                                return a.name.localeCompare(b.name);
                            } else {
                                return bMetric.uses - aMetric.uses;
                            }
                        case SortOptions.LEAST_USED:
                            if (aMetric.uses === bMetric.uses) {
                                return b.name.localeCompare(a.name);
                            } else {
                                return aMetric.uses - bMetric.uses;
                            }
                        default:
                            return a.name.localeCompare(b.name);
                    }
                })
                .map((color: Colorway, i: number) => <ColorwayItem
                    key={i}
                    id={"colorway-" + color.name}
                    aria-invalid={invalidColorwayClicked === "colorway-" + color.name}
                    aria-checked={contexts.activeColorwayObject.id === color.name && contexts.activeColorwayObject.source === color.source}
                    onClick={async () => {
                        if (contexts.activeColorwayObject.id === color.name && contexts.activeColorwayObject.source === color.source) {
                            setContext("activeColorwayObject", nullColorwayObj);

                            Manager.removeColorway();
                            showNotification(`Disabled Colorway "${color.name}"`);
                        } else {
                            const newObj: ColorwayObject = {
                                id: color.name,
                                sourceType: color.sourceType,
                                source: color.source,
                                colors: {} as ColorwayObject["colors"]
                            };
                            color.accent ? (newObj.colors.accent = "#" + colorToHex(color.accent)) : void 0;
                            color.primary ? (newObj.colors.primary = "#" + colorToHex(color.primary)) : void 0;
                            color.secondary ? (newObj.colors.secondary = "#" + colorToHex(color.secondary)) : void 0;
                            color.tertiary ? (newObj.colors.tertiary = "#" + colorToHex(color.tertiary)) : void 0;
                            color.linearGradient ? (newObj.linearGradient = color.linearGradient) : void 0;

                            Manager.sendColorway(newObj);

                            setContext("activeColorwayObject", newObj);

                            showNotification(`Applied Colorway "${color.name}"`);

                            if (contexts.colorwayUsageMetrics.filter(metric => compareColorwayObjects(metric, newObj)).length) {
                                setContext("colorwayUsageMetrics", contexts.colorwayUsageMetrics.map(metric => {
                                    if (compareColorwayObjects(metric, newObj)) {
                                        return { ...metric, uses: metric.uses + 1 };
                                    }
                                    return metric;
                                }));
                            } else {
                                setContext("colorwayUsageMetrics", [...contexts.colorwayUsageMetrics, { ...newObj, uses: 1 }]);
                            }
                        }
                    }}
                    menu={<>
                        <div className="flex justify-center items-center p-1 rounded-sm gap-0.5">
                            {(color.colors || [
                                "accent",
                                "primary",
                                "secondary",
                                "tertiary",
                            ]).map((c: string, i: number) => <div key={i} className="rounded-xs cursor-pointer hover:bg-primary-200 dark:hover:bg-primary-600 transition w-full h-11 min-w-11 first-of-type:rounded-l-lg last-of-type:rounded-r-lg hover:brightness-75" style={{ backgroundColor: "#" + colorToHex(color[c]) }} onClick={() => {
                                Dispatcher.emit("CLOSE_CONTEXT_MENU", null);
                                navigator.clipboard.writeText("#" + colorToHex(color[c]));
                            }} />)}
                        </div>
                        <ContextMenuItem
                            onClick={() => {
                                Dispatcher.emit("CLOSE_CONTEXT_MENU", null);
                                const colorwayIDArray = `${color.accent},${color.primary},${color.secondary},${color.tertiary}|n:${color.name}${color.preset ? `|p:${color.preset}` : ""}`;
                                const colorwayID = Parsers.stringToHex(colorwayIDArray);
                                navigator.clipboard.writeText(colorwayID);
                                showNotification("Copied Colorway ID");
                            }}

                        >
                            Copy Colorway ID
                            <IDIcon width={16} height={16} style={{
                                marginLeft: "8px"
                            }} />
                        </ContextMenuItem>
                        {color.sourceType === "offline" ? <>
                            <ContextMenuItem
                                onClick={async () => {
                                    Dispatcher.emit("CLOSE_CONTEXT_MENU", null);
                                    openModal(props => <SaveColorwayAsModal
                                        store={color.source}
                                        colorwayObject={{
                                            id: color.name,
                                            source: color.source,
                                            sourceType: color.sourceType,
                                            colors: {
                                                accent: colorToHex(color.accent) || "5865f2",
                                                primary: colorToHex(color.primary) || "313338",
                                                secondary: colorToHex(color.secondary) || "2b2d31",
                                                tertiary: colorToHex(color.tertiary) || "1e1f22"
                                            }
                                        }}
                                        modalProps={props}
                                    />);
                                }}

                            >
                                Edit Colorway
                                <PencilIcon width={16} height={16} style={{
                                    marginLeft: "8px"
                                }} />
                            </ContextMenuItem>
                            <ContextMenuItem
                                onClick={() => {
                                    Dispatcher.emit("CLOSE_CONTEXT_MENU", null);
                                    openModal(props => <Modal
                                        modalProps={props}
                                        title="Delete Colorway"
                                        onFinish={async ({ closeModal }) => {
                                            if (contexts.activeColorwayObject.id === color.name) {
                                                setContext("activeColorwayObject", nullColorwayObj);
                                            }
                                            updateCustomSource({ type: SourceActions.RemoveColorway, colorway: color, source: color.source as string });
                                            closeModal();
                                        }}
                                        confirmMsg="Delete"
                                        type="danger"
                                    >
                                        Are you sure you want to delete this colorway? This cannot be undone!
                                    </Modal>);
                                }}
                                dangerous
                            >
                                Delete Colorway...
                                <DeleteIcon width={16} height={16} style={{
                                    marginLeft: "8px"
                                }} />
                            </ContextMenuItem>
                        </> : null}
                        {color.sourceType === "online" ? <>
                            <ContextMenuItem
                                onClick={async () => {
                                    Dispatcher.emit("CLOSE_CONTEXT_MENU", null);
                                    openModal(props => <SaveColorwayAsModal
                                        colorwayObject={{
                                            id: color.name,
                                            source: color.source,
                                            sourceType: color.sourceType,
                                            colors: {
                                                accent: colorToHex(color.accent) || "5865f2",
                                                primary: colorToHex(color.primary) || "313338",
                                                secondary: colorToHex(color.secondary) || "2b2d31",
                                                tertiary: colorToHex(color.tertiary) || "1e1f22"
                                            }
                                        }}
                                        modalProps={props}
                                    />);
                                }}

                            >
                                Edit Colorway Locally
                                <PencilIcon width={16} height={16} style={{
                                    marginLeft: "8px"
                                }} />
                            </ContextMenuItem>
                        </> : null}
                    </>}
                    colors={Object.values({
                        accent: color.accent,
                        primary: color.primary,
                        secondary: color.secondary,
                        tertiary: color.tertiary
                    })}
                    text={color.name}
                    descriptions={[`by ${color.author}`, `from ${color.source}`]}
                />)
            }
            {(!filters.flatMap(f => f.sources.map(s => s.colorways)).flat().length) ? <ColorwayItem text="It's quite emty in here." descriptions={["Try searching for something else, or add another source"]} id="colorway-nocolorways" /> : null}
        </div >
    </>;
}
