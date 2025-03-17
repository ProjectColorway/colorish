import { useEffect, useState } from "react";
import { compareColorwayObjects, Hooks, Manager, stringToHex } from "../api";
import { useTimedState } from "../api/Hooks";
import { nullColorwayObj } from "../constants";
import { getAutoPresets } from "../css";
import { Colorway, ColorwayObject, Preset, SortOptions, SourceActions, SourceObject } from "../types";
import ColorwayItem from "./Colorway";
import ComboTextBox from "./ComboTextBox";
import { DeleteIcon, IDIcon, PencilIcon, PlusIcon } from "./Icons";
import Modal from "./Modal";
import SaveColorwayAsModal from "./Modals/SaveColorwayAsModal";
import Radio from "./Radio";
import ReloadButton from "./ReloadButton";
import Spinner from "./Spinner";
import StaticOptionsMenu from "./StaticOptionsMenu";
import { colorToHex } from "@renderer/api/Colors";
import { openModal, showNotification } from "@renderer/App";
import { setContext } from "@renderer/api/Contexts";

export function get_updateCustomSource(customColorwayData: {
    name: string;
    colorways?: Colorway[];
    presets?: Preset[];
}[], setCustomColorwayData: (list: {
    name: string;
    colorways?: Colorway[];
    presets?: Preset[];
}[]) => void) {
    return function updateCustomSource(props: { source: string; } & ({ type: SourceActions.AddColorway | SourceActions.RemoveColorway, colorway: Colorway; } | { type: SourceActions.AddPreset | SourceActions.RemovePreset, preset: Preset; })) {
        if (props.type === SourceActions.AddColorway) {
            const srcList = customColorwayData.map(s => {
                if (s.name === props.source) {
                    return { name: s.name, colorways: [...(s.colorways || []), props.colorway], presets: s.presets || [] };
                }
                return s;
            });
            setCustomColorwayData(srcList);
        }
        if (props.type === SourceActions.RemoveColorway) {
            const srcList = customColorwayData.map(s => {
                if (s.name === props.source) {
                    return { name: s.name, colorways: (s.colorways || []).filter(c => c.name !== props.colorway.name), presets: s.presets || [] };
                }
                return s;
            });
            setCustomColorwayData(srcList);
        }
        if (props.type === SourceActions.AddPreset) {
            const srcList = customColorwayData.map(s => {
                if (s.name === props.source) {
                    return { name: s.name, colorways: s.colorways || [], presets: [...(s.presets || []), props.preset] };
                }
                return s;
            });
            setCustomColorwayData(srcList);
        }
        if (props.type === SourceActions.RemovePreset) {
            const srcList = customColorwayData.map(s => {
                if (s.name === props.source) {
                    return { name: s.name, colorways: s.colorways || [], presets: (s.presets || []).filter(p => p.name !== props.preset.name) };
                }
                return s;
            });
            setCustomColorwayData(srcList);
        }
    };
}

export default function () {
    const [colorwayData] = Hooks.useContextualState("colorwayData", false);
    const [customColorwayData, setCustomColorwayData] = Hooks.useContextualState("customColorways");
    const [activeColorwayObject, setActiveColorwayObject] = Hooks.useContextualState("activeColorwayObject");
    const [wsConnected] = Hooks.useContextualState("isConnected");
    const [isManager] = Hooks.useContextualState("hasManagerRole");
    const [usageMetrics, setUsageMetrics] = Hooks.useContextualState("colorwayUsageMetrics");
    const [connectedApps] = Hooks.useContextualState("connectedApps");
    const [colorwaySourceFiles] = Hooks.useContextualState("colorwaySourceFiles");
    const [activeAutoPreset] = Hooks.useContextualState("activeAutoPreset");
    const [invalidColorwayClicked, setInvalidColorwayClicked] = useTimedState<string>("", 2000);
    const [searchValue, setSearchValue] = useState<string>("");
    const [sortBy, setSortBy] = useState<SortOptions>(SortOptions.MOST_USED);
    const [showSpinner, setShowSpinner] = useState<boolean>(false);
    const [visibleSources, setVisibleSources] = useState<string>("all");

    const updateCustomSource = get_updateCustomSource(customColorwayData, setCustomColorwayData);

    const filters = [
        {
            name: "All",
            id: "all",
            appName: "All Sources",
            sources: [...colorwayData, ...customColorwayData.map(source => ({ source: source.name, colorways: source.colorways, type: "offline" }))]
        },
        ...colorwayData.map(source => ({
            name: source.source,
            appName: source.appName,
            id: source.source.toLowerCase().replaceAll(" ", "-"),
            sources: [source]
        })),
        ...customColorwayData.map(source => ({
            name: source.name,
            appName: "This Manager",
            id: source.name.toLowerCase().replaceAll(" ", "-"),
            sources: [{ source: source.name, colorways: source.colorways, type: "offline" }]
        })),
        ...connectedApps.map(app => app.offline.map(source => ({ appName: Manager.getClientDisplayName(Object.values(app.boundKey)[0] as string), name: source.name, id: source.name.toLowerCase().replaceAll(" ", "-"), sources: [source] }))).flat()
    ];

    useEffect(() => {
        async function reload(e: KeyboardEvent) {
            if (e.ctrlKey && e.code === 'KeyR') {
                e.preventDefault();
                setShowSpinner(true);

                const responses: ({ appId: string, appName: string, url: string, name: string, response: Response; })[] = await Promise.all(
                    ([
                        ...colorwaySourceFiles.map(s => ({ ...s, appId: "this-manager", appName: "This Manager" })),
                        ...connectedApps.filter(source => !colorwaySourceFiles.map(s => s.url).includes(source.url)).map(app => app.online.map(s => ({ ...s, appId: Object.values(app.boundKey)[0], appName: Manager.getClientDisplayName(Object.values(app.boundKey)[0] as string) }))).flat().map(s => ({ name: s.name, url: s.url, appName: s.appName, appId: s.appId } as { appId: string, appName: string, url: string, name: string; }))
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
        <ComboTextBox
            placeholder="Search for Colorways..."
            value={searchValue}
            onInput={setSearchValue}
            page={{
                index: 0,
                placeholder: "Search for Colorways..."
            }}
        >
            <Spinner className={`dc-selector-spinner${!showSpinner ? " dc-selector-spinner-hidden" : ""}`} />
            <StaticOptionsMenu
                xPos="right"
                menu={<>
                    <ReloadButton setShowSpinner={setShowSpinner} />
                    <button
                        className="dc-contextmenu-item"
                        onClick={() => openModal(props => <SaveColorwayAsModal modalProps={props} />)}
                    >
                        Add...
                        <PlusIcon width={18} height={18} style={{ boxSizing: "content-box" }} />
                    </button>
                    <div className="dc-contextmenu-divider" />
                    <div className="dc-contextmenu-label">Source</div>
                    {filters.map(({ name, id, appName }) => {
                        return <button onClick={() => setVisibleSources(id)} className="dc-contextmenu-item">
                            {name} (from {appName})
                            <Radio checked={visibleSources === id} style={{
                                marginLeft: "8px"
                            }} />
                        </button>;
                    })}
                    <div className="dc-contextmenu-divider" />
                    <div className="dc-contextmenu-label">Sort By</div>
                    <button onClick={() => setSortBy(9)} className="dc-contextmenu-item">
                        Most Used
                        <Radio checked={sortBy === 9} style={{
                            marginLeft: "8px"
                        }} />
                    </button>
                    <button onClick={() => setSortBy(10)} className="dc-contextmenu-item">
                        Least Used
                        <Radio checked={sortBy === 10} style={{
                            marginLeft: "8px"
                        }} />
                    </button>
                    <button onClick={() => setSortBy(1)} className="dc-contextmenu-item">
                        Name (A-Z)
                        <Radio checked={sortBy === 1} style={{
                            marginLeft: "8px"
                        }} />
                    </button>
                    <button onClick={() => setSortBy(2)} className="dc-contextmenu-item">
                        Name (Z-A)
                        <Radio checked={sortBy === 2} style={{
                            marginLeft: "8px"
                        }} />
                    </button>
                    <button onClick={() => setSortBy(3)} className="dc-contextmenu-item">
                        Source (A-Z)
                        <Radio checked={sortBy === 3} style={{
                            marginLeft: "8px"
                        }} />
                    </button>
                    <button onClick={() => setSortBy(4)} className="dc-contextmenu-item">
                        Source (Z-A)
                        <Radio checked={sortBy === 4} style={{
                            marginLeft: "8px"
                        }} />
                    </button>
                    <button onClick={() => setSortBy(5)} className="dc-contextmenu-item">
                        Source Type (Online First)
                        <Radio checked={sortBy === 5} style={{
                            marginLeft: "8px"
                        }} />
                    </button>
                    <button onClick={() => setSortBy(6)} className="dc-contextmenu-item">
                        Source Type (Offline First)
                        <Radio checked={sortBy === 6} style={{
                            marginLeft: "8px"
                        }} />
                    </button>
                    <button onClick={() => setSortBy(7)} className="dc-contextmenu-item">
                        Color Count (Ascending)
                        <Radio checked={sortBy === 7} style={{
                            marginLeft: "8px"
                        }} />
                    </button>
                    <button onClick={() => setSortBy(8)} className="dc-contextmenu-item">
                        Color Count (Descending)
                        <Radio checked={sortBy === 8} style={{
                            marginLeft: "8px"
                        }} />
                    </button>
                </>}>
                {({ onClick }) => <button
                    className="dc-button dc-button-primary dc-button-icon"
                    onClick={onClick}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
                        <path d="M13.024 9.25c.47 0 .827-.433.637-.863a4 4 0 0 0-4.094-2.364c-.468.05-.665.576-.43.984l1.08 1.868a.75.75 0 0 0 .649.375h2.158ZM7.84 7.758c-.236-.408-.79-.5-1.068-.12A3.982 3.982 0 0 0 6 10c0 .884.287 1.7.772 2.363.278.38.832.287 1.068-.12l1.078-1.868a.75.75 0 0 0 0-.75L7.839 7.758ZM9.138 12.993c-.235.408-.039.934.43.984a4 4 0 0 0 4.094-2.364c.19-.43-.168-.863-.638-.863h-2.158a.75.75 0 0 0-.65.375l-1.078 1.868Z" />
                        <path fillRule="evenodd" d="m14.13 4.347.644-1.117a.75.75 0 0 0-1.299-.75l-.644 1.116a6.954 6.954 0 0 0-2.081-.556V1.75a.75.75 0 0 0-1.5 0v1.29a6.954 6.954 0 0 0-2.081.556L6.525 2.48a.75.75 0 1 0-1.3.75l.645 1.117A7.04 7.04 0 0 0 4.347 5.87L3.23 5.225a.75.75 0 1 0-.75 1.3l1.116.644A6.954 6.954 0 0 0 3.04 9.25H1.75a.75.75 0 0 0 0 1.5h1.29c.078.733.27 1.433.556 2.081l-1.116.645a.75.75 0 1 0 .75 1.298l1.117-.644a7.04 7.04 0 0 0 1.523 1.523l-.645 1.117a.75.75 0 1 0 1.3.75l.644-1.116a6.954 6.954 0 0 0 2.081.556v1.29a.75.75 0 0 0 1.5 0v-1.29a6.954 6.954 0 0 0 2.081-.556l.645 1.116a.75.75 0 0 0 1.299-.75l-.645-1.117a7.042 7.042 0 0 0 1.523-1.523l1.117.644a.75.75 0 0 0 .75-1.298l-1.116-.645a6.954 6.954 0 0 0 .556-2.081h1.29a.75.75 0 0 0 0-1.5h-1.29a6.954 6.954 0 0 0-.556-2.081l1.116-.644a.75.75 0 0 0-.75-1.3l-1.117.645a7.04 7.04 0 0 0-1.524-1.523ZM10 4.5a5.475 5.475 0 0 0-2.781.754A5.527 5.527 0 0 0 5.22 7.277 5.475 5.475 0 0 0 4.5 10a5.475 5.475 0 0 0 .752 2.777 5.527 5.527 0 0 0 2.028 2.004c.802.458 1.73.719 2.72.719a5.474 5.474 0 0 0 2.78-.753 5.527 5.527 0 0 0 2.001-2.027c.458-.802.719-1.73.719-2.72a5.475 5.475 0 0 0-.753-2.78 5.528 5.528 0 0 0-2.028-2.002A5.475 5.475 0 0 0 10 4.5Z" clipRule="evenodd" />
                    </svg>
                </button>}
            </StaticOptionsMenu>
        </ComboTextBox>
        <div style={{ maxHeight: "unset" }} className="dc-selector">
            {(activeColorwayObject.sourceType === "temporary") && <div
                className="dc-colorway"
                id="colorway-Temporary"
                role="button"
                aria-checked={activeColorwayObject.sourceType === "temporary"}
                aria-invalid={invalidColorwayClicked === "colorway-Temporary"}
                onClick={async () => {
                    if (wsConnected) {
                        if (!isManager) {
                            setInvalidColorwayClicked("colorway-Temporary");
                        } else {
                            setActiveColorwayObject(nullColorwayObj);
                        }
                    } else {
                        setActiveColorwayObject(nullColorwayObj);
                    }
                }}
            >
                <div className="dc-color-swatch">
                    <div
                        className="dc-color-swatch-part"
                        style={{ backgroundColor: "#" + activeColorwayObject.colors.accent }} />
                    <div
                        className="dc-color-swatch-part"
                        style={{ backgroundColor: "#" + activeColorwayObject.colors.primary }} />
                    <div
                        className="dc-color-swatch-part"
                        style={{ backgroundColor: "#" + activeColorwayObject.colors.secondary }} />
                    <div
                        className="dc-color-swatch-part"
                        style={{ backgroundColor: "#" + activeColorwayObject.colors.tertiary }} />
                </div>
                <div className="dc-label-wrapper">
                    <span className="dc-label">{activeColorwayObject.id}</span>
                    <span className="dc-label dc-subnote dc-note">Temporary Colorway</span>
                </div>
                <button
                    className="dc-button dc-button-secondary"
                    onClick={async e => {
                        e.stopPropagation();
                        openModal(props => <SaveColorwayAsModal
                            modalProps={props}
                            colorwayObject={activeColorwayObject}
                        />);
                    }}
                >
                    <PlusIcon width={20} height={20} />
                </button>
            </div>}
            {getComputedStyle(document.body).getPropertyValue("--os-accent-color") && "auto".includes(searchValue.toLowerCase()) ? <ColorwayItem
                id="colorway-Auto"
                text="Auto Colorway"
                descriptions={[`Active preset: ${Object.values(getAutoPresets()).find(pr => pr.id === activeAutoPreset)?.name}`]}
                colors={[
                    getAutoPresets(colorToHex(getComputedStyle(document.body).getPropertyValue("--os-accent-color")).slice(0, 6))[activeAutoPreset].colors.accent,
                    getAutoPresets(colorToHex(getComputedStyle(document.body).getPropertyValue("--os-accent-color")).slice(0, 6))[activeAutoPreset].colors.primary,
                    getAutoPresets(colorToHex(getComputedStyle(document.body).getPropertyValue("--os-accent-color")).slice(0, 6))[activeAutoPreset].colors.secondary,
                    getAutoPresets(colorToHex(getComputedStyle(document.body).getPropertyValue("--os-accent-color")).slice(0, 6))[activeAutoPreset].colors.tertiary
                ]}
                aria-checked={activeColorwayObject.id === "Auto" && activeColorwayObject.sourceType === "auto"}
                aria-invalid={invalidColorwayClicked === "colorway-Auto"}
                onClick={async () => {
                    if (activeColorwayObject.id === "Auto" && activeColorwayObject.sourceType === "auto") {
                        setActiveColorwayObject(nullColorwayObj);

                        Manager.removeColorway();
                        showNotification(`Disabled Auto Colorway`);
                    } else {
                        const { colors } = getAutoPresets(colorToHex(getComputedStyle(document.body).getPropertyValue("--os-accent-color")).slice(0, 6))[activeAutoPreset];
                        const newObj: ColorwayObject = {
                            id: "Auto",
                            sourceType: "auto",
                            source: null,
                            colors: colors
                        };

                        setActiveColorwayObject(newObj);
                        Manager.sendColorway(newObj);

                        showNotification(`Applied Auto Colorway`);
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
                    const aMetric = usageMetrics.filter(metric => compareColorwayObjects(metric, objA))[0] || { ...objA, uses: 0 };
                    const bMetric = usageMetrics.filter(metric => compareColorwayObjects(metric, objB))[0] || { ...objB, uses: 0 };
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
                .filter(({ name }) => name.toLowerCase().includes(searchValue.toLowerCase()))
                .map((color: Colorway) => <ColorwayItem
                    id={"colorway-" + color.name}
                    aria-invalid={invalidColorwayClicked === "colorway-" + color.name}
                    aria-checked={activeColorwayObject.id === color.name && activeColorwayObject.source === color.source}
                    onClick={async () => {
                        if (activeColorwayObject.id === color.name && activeColorwayObject.source === color.source) {
                            setActiveColorwayObject(nullColorwayObj);

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

                            setActiveColorwayObject(newObj);

                            showNotification(`Applied Colorway "${color.name}"`);

                            if (usageMetrics.filter(metric => compareColorwayObjects(metric, newObj)).length) {
                                setUsageMetrics(m => m.map(metric => {
                                    if (compareColorwayObjects(metric, newObj)) {
                                        return { ...metric, uses: metric.uses + 1 };
                                    }
                                    return metric;
                                }));
                            } else {
                                setUsageMetrics(m => [...m, { ...newObj, uses: 1 }]);
                            }
                        }
                    }}
                    menu={<>
                        <div className="flex justify-center items-center gap-0.5 p-1 rounded-sm">
                            {(color.colors || [
                                "accent",
                                "primary",
                                "secondary",
                                "tertiary",
                            ]).map(c => <div className="cursor-pointer hover:bg-primary-200 dark:hover:bg-primary-600 transition rounded-sm w-full h-11 min-w-11" style={{ backgroundColor: "#" + colorToHex(color[c]) }} onClick={() => {
                                navigator.clipboard.writeText("#" + colorToHex(color[c]));
                            }} />)}
                        </div>
                        <button onClick={() => {
                            const colorwayIDArray = `${color.accent},${color.primary},${color.secondary},${color.tertiary}|n:${color.name}${color.preset ? `|p:${color.preset}` : ""}`;
                            const colorwayID = stringToHex(colorwayIDArray);
                            navigator.clipboard.writeText(colorwayID);
                            showNotification(`Copied Colorway ID`);
                        }} className="dc-contextmenu-item">
                            Copy Colorway ID
                            <IDIcon width={16} height={16} style={{
                                marginLeft: "8px"
                            }} />
                        </button>
                        {color.sourceType === "offline" ? <>
                            <button onClick={async () => {
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
                            }} className="dc-contextmenu-item">
                                Edit Colorway
                                <PencilIcon width={16} height={16} style={{
                                    marginLeft: "8px"
                                }} />
                            </button>
                            <button onClick={() => {
                                openModal(props => <Modal
                                    modalProps={props}
                                    title="Delete Colorway"
                                    onFinish={async ({ closeModal }) => {
                                        if (activeColorwayObject.id === color.name) {
                                            setActiveColorwayObject(nullColorwayObj);
                                        }
                                        updateCustomSource({ type: SourceActions.RemoveColorway, colorway: color, source: color.source as string });
                                        closeModal();
                                    }}
                                    confirmMsg="Delete"
                                    type="danger"
                                >
                                    Are you sure you want to delete this colorway? This cannot be undone!
                                </Modal>);
                            }} className="dc-contextmenu-item dc-contextmenu-item-danger">
                                Delete Colorway...
                                <DeleteIcon width={16} height={16} style={{
                                    marginLeft: "8px"
                                }} />
                            </button>
                        </> : null}
                        {color.sourceType === "online" ? <>
                            <button onClick={async () => {
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
                            }} className="dc-contextmenu-item">
                                Edit Colorway Locally
                                <PencilIcon width={16} height={16} style={{
                                    marginLeft: "8px"
                                }} />
                            </button>
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
