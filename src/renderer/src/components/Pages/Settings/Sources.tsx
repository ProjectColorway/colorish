/* eslint-disable react-compiler/react-compiler */
/* eslint-disable no-unsafe-optional-chaining */
import { Dispatcher, Manager } from "@renderer/api";
import { setContext } from "@renderer/api/Contexts";
import { chooseFile, saveFile } from "@renderer/api/Fs";
import { useContextualState, useCustomContext } from "@renderer/api/Hooks";
import { openModal } from "@renderer/api/Modals";
import { ContextMenuItem, StaticContextMenu } from "@renderer/components/ContextMenu";
import { CopyIcon, DeleteIcon, DownloadIcon, ImportIcon, PlusIcon, WirelessIcon } from "@renderer/components/Icons";
import Modal from "@renderer/components/Modals/Modal";
import NewStoreModal from "@renderer/components/Modals/NewStoreModal";
import Radio from "@renderer/components/Radio";
import Spinner from "@renderer/components/Spinner";
import { defaultColorwaySource } from "@renderer/constants";
import { SortOptions } from "@renderer/types";
import { useLayoutEffect, useRef, useState } from "react";

import OnlineSourceMeta from "./OnlineSourceMeta";

export default function Sources() {
    const [sortBy, setSortBy] = useState<SortOptions>(SortOptions.NAME_AZ);
    const [showSpinner] = useState<boolean>(false);
    const [colorwaySourceFiles, setColorwaySourceFiles] = useContextualState("colorwaySourceFiles");
    const [connectedApps] = useContextualState("connectedApps");
    const [customColorways, setCustomColorwayStores] = useContextualState("customColorways");

    const thisManagerApp = useCustomContext(({ colorwaySourceFiles, customColorways }) => ({
        id: "this-manager",
        name: "This Manager",
        online: colorwaySourceFiles,
        offline: customColorways,
        dispatch() { }
    }));

    const [activeApp, setActiveApp] = useState<{
        online: { name: string, url: string; }[];
        offline: { name: string, colorways?: Colorway[], presets?: Preset[]; }[],
        id: string,
        name: string,
        dispatch: any;
    }>(thisManagerApp);

    async function setOnline(obj: { name: string, url: string; }, action: "add" | "remove") {
        if (action === "add") {
            setColorwaySourceFiles(srcList => [...srcList, obj]);
        }
        if (action === "remove") {
            setColorwaySourceFiles(srcList => srcList.filter(src => src.name !== obj.name && src.url !== obj.url));
        }

        const responses: ({ appId: string, appName: string, url: string, name: string, response: Response; })[] = await Promise.all(
            ([
                ...colorwaySourceFiles.map(s => ({ ...s, appId: "this-manager", appName: "This Manager" })),
                ...connectedApps.filter(source => !colorwaySourceFiles.map(s => s.url).includes(source.url)).map(app => app.online.map(s => ({ ...s, appId: Object.values(app.boundKey)[0], appName: Manager.getClientDisplayName(Object.values(app.boundKey)[0] as string) }))).flat().map(s => ({ name: s.name, url: s.url, appName: s.appName, appId: s.appId } as { appId: string, appName: string, url: string, name: string; }))
            ] as { appId: string, appName: string, url: string, name: string; }[]).map(async source => ({ ...source, response: await fetch(source.url) }))
        );

        setContext("colorwayData", await Promise.all(
            responses.map(async res => ({ type: "online", source: res?.name, colorways: (await res?.response.json()).colorways, appName: res?.appName, appId: res?.appId }))
        ) as { type: "online" | "offline", source: string, colorways: Colorway[], appName: string, appId: string; }[], false);
    }

    function setOffline(obj: { name: string, colorways: Colorway[], presets: Preset[]; }, action: "add" | "remove") {
        if (action === "add") {
            setCustomColorwayStores(srcList => [...srcList, obj]);
        }
        if (action === "remove") {
            setCustomColorwayStores(srcList => srcList.filter(src => src.name !== obj.name));
        }
    }

    return <>
        <div className="flex items-center gap-1">
            <Spinner className={`dc-selector-spinner${!showSpinner ? " dc-selector-spinner-hidden" : ""}`} />
            <StaticContextMenu
                xPos="left"
                menu={<>
                    <ContextMenuItem
                        onClick={() => openModal(props => <NewStoreModal
                            modalProps={props}
                            onOnline={async ({ name, url }) => setOnline({ name, url }, "add")}
                            onOffline={async ({ name }) => setOffline({ name, presets: [], colorways: [] }, "add")}
                        />)}
                    >
                        New...
                        <PlusIcon width={18} height={18} style={{ boxSizing: "content-box" }} />
                    </ContextMenuItem>
                    <ContextMenuItem
                        onClick={async () => {
                            const file = await chooseFile("application/json");
                            if (!file) return;

                            const reader = new FileReader();
                            reader.onload = () => {
                                try {
                                    openModal(props => <NewStoreModal
                                        modalProps={props}
                                        offlineOnly
                                        name={JSON.parse(reader.result as string).name}
                                        onOffline={async ({ name }) => {
                                            setOffline({ name, colorways: JSON.parse(reader.result as string).colorways || [], presets: JSON.parse(reader.result as string).presets || [] }, "add");
                                        }} />);
                                } catch (err) {
                                    console.error("DiscordColorways: " + err);
                                }
                            };
                            reader.readAsText(file);
                        }}
                    >
                        Import Offline...
                        <ImportIcon width={18} height={18} />
                    </ContextMenuItem>
                    <div className="dc-contextmenu-divider" />
                    <div className="dc-contextmenu-label">Apps</div>
                    {[thisManagerApp, ...((window as any).dc_win ? dc_win.getWsClients() : []).map(ws => ({ ...ws, name: Manager.getClientDisplayName(Object.values(ws.boundKey)[0] as string), id: Object.values(ws.boundKey)[0] }))].map((app, i: number) => <ContextMenuItem key={i} onClick={() => {
                        setActiveApp(app);
                    }}>{app.name}<Radio style={{ marginLeft: "8px" }} checked={activeApp.id === app.id} /></ContextMenuItem>)}
                    <div className="dc-contextmenu-divider" />
                    <div className="dc-contextmenu-label">Sort By</div>
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
                </>}>
                {({ onClick, containerRef }) => <button
                    className="dc-button dc-button-primary"
                    onClick={onClick}
                    ref={containerRef}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
                        <path d="M13.024 9.25c.47 0 .827-.433.637-.863a4 4 0 0 0-4.094-2.364c-.468.05-.665.576-.43.984l1.08 1.868a.75.75 0 0 0 .649.375h2.158ZM7.84 7.758c-.236-.408-.79-.5-1.068-.12A3.982 3.982 0 0 0 6 10c0 .884.287 1.7.772 2.363.278.38.832.287 1.068-.12l1.078-1.868a.75.75 0 0 0 0-.75L7.839 7.758ZM9.138 12.993c-.235.408-.039.934.43.984a4 4 0 0 0 4.094-2.364c.19-.43-.168-.863-.638-.863h-2.158a.75.75 0 0 0-.65.375l-1.078 1.868Z" />
                        <path fillRule="evenodd" d="m14.13 4.347.644-1.117a.75.75 0 0 0-1.299-.75l-.644 1.116a6.954 6.954 0 0 0-2.081-.556V1.75a.75.75 0 0 0-1.5 0v1.29a6.954 6.954 0 0 0-2.081.556L6.525 2.48a.75.75 0 1 0-1.3.75l.645 1.117A7.04 7.04 0 0 0 4.347 5.87L3.23 5.225a.75.75 0 1 0-.75 1.3l1.116.644A6.954 6.954 0 0 0 3.04 9.25H1.75a.75.75 0 0 0 0 1.5h1.29c.078.733.27 1.433.556 2.081l-1.116.645a.75.75 0 1 0 .75 1.298l1.117-.644a7.04 7.04 0 0 0 1.523 1.523l-.645 1.117a.75.75 0 1 0 1.3.75l.644-1.116a6.954 6.954 0 0 0 2.081.556v1.29a.75.75 0 0 0 1.5 0v-1.29a6.954 6.954 0 0 0 2.081-.556l.645 1.116a.75.75 0 0 0 1.299-.75l-.645-1.117a7.042 7.042 0 0 0 1.523-1.523l1.117.644a.75.75 0 0 0 .75-1.298l-1.116-.645a6.954 6.954 0 0 0 .556-2.081h1.29a.75.75 0 0 0 0-1.5h-1.29a6.954 6.954 0 0 0-.556-2.081l1.116-.644a.75.75 0 0 0-.75-1.3l-1.117.645a7.04 7.04 0 0 0-1.524-1.523ZM10 4.5a5.475 5.475 0 0 0-2.781.754A5.527 5.527 0 0 0 5.22 7.277 5.475 5.475 0 0 0 4.5 10a5.475 5.475 0 0 0 .752 2.777 5.527 5.527 0 0 0 2.028 2.004c.802.458 1.73.719 2.72.719a5.474 5.474 0 0 0 2.78-.753 5.527 5.527 0 0 0 2.001-2.027c.458-.802.719-1.73.719-2.72a5.475 5.475 0 0 0-.753-2.78 5.528 5.528 0 0 0-2.028-2.002A5.475 5.475 0 0 0 10 4.5Z" clipRule="evenodd" />
                    </svg>
                    Filters
                </button>}
            </StaticContextMenu>
        </div>
        <div className="dc-selector !grid-cols-1">
            {(getComputedStyle(document.body).getPropertyValue("--os-accent-color") && activeApp.id === "this-manager") ? <div
                className="colorway-pure first-of-type:rounded-t-2xl last-of-type:rounded-b-2xl"
                style={{ cursor: "default" }}
                id="colorwaySource-auto"
            >
                <div className="dc-label-wrapper">
                    <span className="dc-label">OS Accent Color</span>
                    <span className="dc-label dc-subnote dc-note"><div className="dc-badge">Offline • Built-In</div> • Auto Colorway</span>
                </div>
            </div> : <></>}
            {(![
                ...(activeApp.id === "this-manager" ? colorwaySourceFiles : activeApp.online).map(src => ({ ...src, type: "online" })) as { name: string, url: string, type: "online"; }[],
                ...(activeApp.id === "this-manager" ? customColorways : activeApp.offline).map(src => ({ ...src, type: "offline" })) as { name: string, colorways: Colorway[], type: "offline"; }[]
            ].length && (!getComputedStyle(document.body).getPropertyValue("--os-accent-color")) && activeApp.id === "this-manager") ? <div
                className="dc-colorway first-of-type:rounded-t-2xl last-of-type:rounded-b-2xl"
                id="colorwaySource-missingSource"
                onClick={async () => setOnline({ name: "Project Colorway", url: defaultColorwaySource }, "add")}>
                <WirelessIcon width={30} height={30} style={{ color: "var(--interactive-active)" }} />
                <div className="dc-label-wrapper">
                    <span className="dc-label">It's quite emty in here.</span>
                    <span className="dc-label dc-subnote dc-note">Click here to add the Project Colorway source</span>
                </div>
            </div> : null}
            {[
                ...(activeApp.id === "this-manager" ? colorwaySourceFiles : activeApp.online).map(src => ({ ...src, type: "online" })) as { name: string, url: string, type: "online"; }[],
                ...(activeApp.id === "this-manager" ? customColorways : activeApp.offline).map(src => ({ ...src, type: "offline" })) as { name: string, colorways: Colorway[], type: "offline"; }[]
            ]
                .sort((a, b) => {
                    switch (sortBy) {
                        case SortOptions.NAME_AZ:
                            return a.name.localeCompare(b.name);
                        case SortOptions.NAME_ZA:
                            return b.name.localeCompare(a.name);
                        default:
                            return a.name.localeCompare(b.name);
                    }
                })
                .map((src: ({ name: string; } & ({ colorways?: Colorway[], presets?: Preset[], type: "offline"; } | { type: "online", url: string; })), i: number) => <div
                    key={i}
                    className="colorway-pure first-of-type:rounded-t-2xl last-of-type:rounded-b-2xl"
                    style={{ cursor: "default" }}
                    id={"colorwaySource" + src.name}
                    onContextMenu={e => {
                        Dispatcher.emit("OPEN_CONTEXT_MENU", {
                            render() {
                                function Menu() {
                                    const targetRef = useRef(null);
                                    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

                                    useLayoutEffect(() => {
                                        if (targetRef.current) {
                                            setDimensions({
                                                width: (targetRef.current as any).offsetWidth,
                                                height: (targetRef.current as any).offsetHeight
                                            });
                                        }
                                    }, []);
                                    return <div ref={targetRef} className={"dc-contextmenu overflow-auto no-scrollbar !fixed"} onClick={e => e.stopPropagation()} style={{
                                        top: `${Math.min(e.pageY, window.innerHeight - dimensions.height - 8)}px`,
                                        left: `${Math.min(e.pageX, window.innerWidth - dimensions.width - 8)}px`
                                    }}>

                                        {src.type === "online" ? <>
                                            <ContextMenuItem onClick={() => {
                                                Dispatcher.emit("CLOSE_CONTEXT_MENU", null);
                                                navigator.clipboard.writeText(src.url as string);
                                            }}>
                                                Copy URL
                                                <CopyIcon width={16} height={16} style={{
                                                    marginLeft: "8px"
                                                }} />
                                            </ContextMenuItem>
                                            <ContextMenuItem
                                                onClick={async () => {
                                                    Dispatcher.emit("CLOSE_CONTEXT_MENU", null);
                                                    openModal(props => <NewStoreModal
                                                        modalProps={props}
                                                        offlineOnly
                                                        name={src.name}
                                                        onOffline={async ({ name }) => {
                                                            const res = await fetch(src.url as string);
                                                            const data = await res.json();
                                                            setOffline({ name, colorways: data.colorways || [], presets: data.presets || [] }, "add");
                                                        }} />);
                                                }}
                                            >
                                                Download...
                                                <DownloadIcon width={14} height={14} />
                                            </ContextMenuItem>
                                        </> : <ContextMenuItem
                                            onClick={async () => {
                                                Dispatcher.emit("CLOSE_CONTEXT_MENU", null);
                                                saveFile(new File([JSON.stringify({ "name": src.name, "colorways": [...(src.colorways || []) as Colorway[]], "presets": [...(src.presets || [])] })], `${src.name.replaceAll(" ", "-").toLowerCase()}.colorways.json`, { type: "application/json" }));
                                            }}
                                        >
                                            Export as...
                                            <DownloadIcon width={14} height={14} />
                                        </ContextMenuItem>}
                                        {activeApp.id === "this-manager" ? <ContextMenuItem
                                            dangerous
                                            onClick={async () => {
                                                Dispatcher.emit("CLOSE_CONTEXT_MENU", null);
                                                openModal(props => <Modal
                                                    modalProps={props}
                                                    title="Remove Source"
                                                    onFinish={async ({ closeModal }) => {
                                                        if (src.type === "online") {
                                                            setOnline({ name: src.name, url: src.url as string }, "remove");
                                                        } else {
                                                            setOffline({ name: src.name, colorways: [], presets: [] }, "remove");
                                                        }
                                                        closeModal();
                                                    }}
                                                    confirmMsg="Delete"
                                                    type="danger"
                                                >
                                                    Are you sure you want to remove this source? This cannot be undone!
                                                </Modal>);
                                            }}
                                        >
                                            Remove
                                            <DeleteIcon width={14} height={14} />
                                        </ContextMenuItem> : null}
                                    </div>;
                                }
                                return <Menu />;
                            }
                        });
                    }}>
                    <div className="dc-label-wrapper">
                        <span className="dc-label">{src.name}</span>
                        {src.type === "online" ? <span className="dc-label dc-subnote dc-note">Online • <OnlineSourceMeta source={src.url} onComplete={({ colorways, presets }) => `${(colorways || []).length} colorways • ${(presets || []).length} presets`} /></span> : <span className="dc-label dc-subnote dc-note">Offline • {(src.colorways || []).length} colorways • {(src.presets || []).length} presets</span>}
                    </div>
                    {activeApp.id === "this-manager" ? <>
                        <div style={{ marginRight: "auto" }} />
                        <button
                            className="dc-button dc-button-icon dc-button-danger"
                            onClick={async () => {
                                openModal(props => <Modal
                                    modalProps={props}
                                    title="Remove Source"
                                    onFinish={async ({ closeModal }) => {
                                        if (src.type === "online") {
                                            setOnline({ name: src.name, url: src.url as string }, "remove");
                                        } else {
                                            setOffline({ name: src.name, colorways: [], presets: [] }, "remove");
                                        }
                                        closeModal();
                                    }}
                                    confirmMsg="Delete"
                                    type="danger"
                                >
                                    Are you sure you want to remove this source? This cannot be undone!
                                </Modal>);
                            }}
                        >
                            <DeleteIcon width={16} height={16} />
                        </button>
                    </> : null}
                </div>
                )}
        </div>
    </>;
}
