/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable react-compiler/react-compiler */
import { Dispatcher, Manager } from "@renderer/api";
import { setContext } from "@renderer/api/Contexts";
import { useContextualState } from "@renderer/api/Hooks";
import { openModal } from "@renderer/api/Modals";
import { ContextMenuItem } from "@renderer/components/ContextMenu";
import { CopyIcon, DeleteIcon, DownloadIcon } from "@renderer/components/Icons";
import Modal from "@renderer/components/Modals/Modal";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import gh_svg from "../../../assets/gh-svg.svg";

export default function Discover() {
    const [storeObject, setStoreObject] = useState<StoreItem[]>([]);
    const [colorwaySourceFiles, setColorwaySourceFiles] = useContextualState("colorwaySourceFiles");
    const [connectedApps] = useContextualState("connectedApps");

    useEffect(() => {
        (async function () {
            const res: Response = await fetch("https://www.dablulite.dev/api/colorways/sources");
            const data = await res.json();
            setStoreObject(data.sources);
        })();
    }, []);

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

    return <>
        <div className="flex items-center gap-1">
            <button
                className="dc-button dc-button-primary"
                style={{ marginTop: "auto", marginBottom: "auto" }}
                onClick={async function () {
                    const res: Response = await fetch("https://www.dablulite.dev/api/colorways/sources");
                    const data = await res.json();
                    setStoreObject(data.sources);
                }}
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-3.5">
                    <path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 0 1-9.201 2.466l-.312-.311h2.433a.75.75 0 0 0 0-1.5H3.989a.75.75 0 0 0-.75.75v4.242a.75.75 0 0 0 1.5 0v-2.43l.31.31a7 7 0 0 0 11.712-3.138.75.75 0 0 0-1.449-.39Zm1.23-3.723a.75.75 0 0 0 .219-.53V2.929a.75.75 0 0 0-1.5 0V5.36l-.31-.31A7 7 0 0 0 3.239 8.188a.75.75 0 1 0 1.448.389A5.5 5.5 0 0 1 13.89 6.11l.311.31h-2.432a.75.75 0 0 0 0 1.5h4.243a.75.75 0 0 0 .53-.219Z" clipRule="evenodd" />
                </svg>
                Refresh
            </button>
        </div>
        <div className="dc-selector !grid-cols-1">
            {storeObject.map((item: StoreItem, i: number) =>
                <div
                    key={i}
                    className="colorway-pure rounded-sm first-of-type:rounded-t-2xl last-of-type:rounded-b-2xl"
                    style={{ cursor: "default" }}
                    id={"colorwaySource" + item.name}
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
                                        <ContextMenuItem onClick={() => {
                                            navigator.clipboard.writeText(item.url);
                                        }}>
                                            Copy URL
                                            <CopyIcon width={16} height={16} style={{
                                                marginLeft: "8px"
                                            }} />
                                        </ContextMenuItem>
                                        <ContextMenuItem
                                            dangerous={colorwaySourceFiles.map(source => source.name).includes(item.name)}
                                            onClick={async () => {
                                                if (colorwaySourceFiles.map(source => source.name).includes(item.name)) {
                                                    openModal(props => <Modal
                                                        modalProps={props}
                                                        title="Remove Source"
                                                        onFinish={async ({ closeModal }) => {
                                                            setOnline({ name: item.name, url: item.url as string }, "remove");
                                                            closeModal();
                                                        }}
                                                        confirmMsg="Delete"
                                                        type="danger"
                                                    >
                                                        Are you sure you want to remove this source? This cannot be undone!
                                                    </Modal>);
                                                } else {
                                                    setOnline({ name: item.name, url: item.url as string }, "add");
                                                }
                                            }}
                                        >
                                            {colorwaySourceFiles.map(source => source.name).includes(item.name) ? <>
                                                Remove
                                                <DeleteIcon width={16} height={16} style={{
                                                    marginLeft: "8px"
                                                }} />
                                            </> : <>
                                                Add Source
                                                <DownloadIcon width={16} height={16} style={{
                                                    marginLeft: "8px"
                                                }} />
                                            </>}
                                        </ContextMenuItem>
                                    </div>;
                                }
                                return <Menu />;
                            }
                        });
                    }}
                >
                    <div className="dc-label-wrapper">
                        <span className="dc-label">{item.name}<span className="dc-label dc-subnote dc-note">by {item.authorGh}</span></span>
                        <span className="dc-label dc-subnote dc-note">{item.description}</span>
                    </div>
                    <div style={{ marginRight: "auto" }} />
                    <button
                        className={`dc-button dc-button-icon${colorwaySourceFiles.map(source => source.name).includes(item.name) ? " dc-button-danger" : ""}`}
                        onClick={async () => {
                            if (colorwaySourceFiles.map(source => source.name).includes(item.name)) {
                                openModal(props => <Modal
                                    modalProps={props}
                                    title="Remove Source"
                                    onFinish={async ({ closeModal }) => {
                                        setOnline({ name: item.name, url: item.url as string }, "remove");
                                        closeModal();
                                    }}
                                    confirmMsg="Delete"
                                    type="danger"
                                >
                                    Are you sure you want to remove this source? This cannot be undone!
                                </Modal>);
                            } else {
                                setOnline({ name: item.name, url: item.url as string }, "add");
                            }
                        }}
                    >
                        {colorwaySourceFiles.map(source => source.name).includes(item.name) ? <DeleteIcon width={16} height={16} /> : <DownloadIcon width={16} height={16} />}
                    </button>
                    <a role="link" className="dc-button dc-button-icon" target="_blank" href={"https://github.com/" + item.authorGh} rel="noreferrer">
                        <img src={gh_svg} width={16} height={16} alt="GitHub" />
                    </a>
                </div>
            )}
        </div>
    </>;
}
