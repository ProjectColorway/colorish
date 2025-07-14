import { colorToHex, hexToString } from "@renderer/api/Colors";
import { setContext } from "@renderer/api/Contexts";
import { useEffect, useReducer, useState } from "react";
import { HexColorPicker } from "react-colorful";

import { useContextualState } from "../../api/Hooks";
import { openModal } from "../../api/Modals";
import { Colorway, ColorwayObject } from "../../types";
import { StaticContextMenu } from "../ContextMenu";
import { PlusIcon } from "../Icons";
import Modal from "../Modals/Modal";
import AuthenticationRequiredModal from "./AuthenticationRequiredModal";
import NewStoreModal from "./NewStoreModal";
export default function ({
    modalProps,
    colorwayID: colorID,
    colorwayObject,
    store = ""
}: {
    modalProps: { onClose(): void; };
    colorwayID?: string;
    colorwayObject?: ColorwayObject;
    store?: string;
}) {
    const [colors, updateColors] = useReducer((colors: {
        accent: string,
        primary: string,
        secondary: string,
        tertiary: string;
    }, action: {
        task: "accent" | "primary" | "secondary" | "tertiary" | "all",
        color?: string;
        colorObj?: {
            accent: string,
            primary: string,
            secondary: string,
            tertiary: string;
        };
    }) => {
        if (action.task === "all") {
            return { ...action.colorObj } as {
                accent: string,
                primary: string,
                secondary: string,
                tertiary: string;
            };
        } else {
            return { ...colors, [action.task as "accent" | "primary" | "secondary" | "tertiary"]: action.color } as {
                accent: string,
                primary: string,
                secondary: string,
                tertiary: string;
            };
        }
    }, colorwayObject ? colorwayObject.colors : {
        accent: "5865f2",
        primary: "313338",
        secondary: "2b2d31",
        tertiary: "1e1f22"
    });
    const [accent, setAccent] = useState("#5865f2");
    const [primary, setPrimary] = useState("#313338");
    const [secondary, setSecondary] = useState("#2b2d31");
    const [tertiary, setTertiary] = useState("#1e1f22");
    const [offlineColorwayStores, setOfflineColorwayStores] = useContextualState("customColorways");
    const [authedUser] = useContextualState("authedUser");
    const [colorwayName, setColorwayName] = useState<string>(colorwayObject ? (colorwayObject.id as string) : "");
    const [noStoreError, setNoStoreError] = useState<boolean>(false);
    const [duplicateError, setDuplicateError] = useState<boolean>(false);
    const [storename, setStorename] = useState<string>(store);
    const [colorwayID, setColorwayID] = useState(colorID);
    const [colorwayIDError, setColorwayIDError] = useState("");

    const setColor = [
        "accent",
        "primary",
        "secondary",
        "tertiary"
    ] as ("accent" | "primary" | "secondary" | "tertiary")[];

    useEffect(() => {
        if (colorwayID) {
            if (!colorwayID.includes(",")) {
                console.error("Invalid Colorway ID");
            } else {
                colorwayID.split("|").forEach((prop: string) => {
                    if (prop.includes(",#")) {
                        prop.split(/,#/).forEach((color: string, i: number) => updateColors({ task: setColor[i], color: colorToHex(color) }));
                    }
                    if (prop.includes("n:")) {
                        setColorwayName(prop.split("n:")[1]);
                    }
                });
            }
        }
    });

    if (authedUser && authedUser.username) {
        return <Modal
            modalProps={modalProps}
            title={(() => {
                if (colorwayID) return "Save Temporary";
                if (colorwayObject && !store) return "Save";
                if (colorwayObject && store) return "Edit";
                return "Create";
            })() + " Colorway"}
            onFinish={async ({ closeModal }) => {
                setNoStoreError(false);
                setDuplicateError(false);
                if (!storename && !store) {
                    return setNoStoreError(true);
                }
                const customColorway: Colorway = {
                    name: (colorwayName || "Colorway"),
                    accent: "#" + colors.accent,
                    primary: "#" + colors.primary,
                    secondary: "#" + colors.secondary,
                    tertiary: "#" + colors.tertiary,
                    author: authedUser.username as string
                };
                if (((offlineColorwayStores.find(s => s.name === storename)!.colorways || []).find(colorway => colorway.name === customColorway.name)) && !store) {
                    return setDuplicateError(true);
                } else {
                    setContext("customColorways", offlineColorwayStores.map(s => {
                        if (s.name === storename) {
                            return { name: s.name, colorways: [...(s.colorways || []).filter(c => c.name !== (colorwayObject || { id: "" }).id), customColorway], presets: s.presets || [] };
                        }
                        return s;
                    }));
                }
                closeModal();
            }}
            additionalButtons={[
                {
                    text: "Enter Colorway ID",
                    type: "primary",
                    action: () => openModal((props: any) => <Modal
                        modalProps={props}
                        onFinish={({ closeModal }) => {
                            setColorwayIDError("");
                            if (!colorwayID) {
                                return setColorwayIDError("Please enter a Colorway ID");
                            } else if (!hexToString(colorwayID).includes(",")) {
                                return setColorwayIDError("Invalid Colorway ID");
                            } else {
                                hexToString(colorwayID).split(/,#/).forEach((color: string, i: number) => updateColors({ task: setColor[i], color: colorToHex(color) }));
                                setColorwayIDError("");
                                closeModal();
                            }
                        }}
                        title="Enter Colorway ID"
                    >
                        <span className={`dc-field-header${colorwayIDError ? " dc-field-header-error" : ""}`} style={{ marginBottom: "4px" }}>Colorway ID{colorwayIDError ? <span className="dc-field-header-errormsg">
                            <span className="dc-field-header-errordiv">-</span>
                            {colorwayIDError}
                        </span> : null}</span>
                        <input
                            type="text"
                            className="dc-textbox"
                            placeholder="Enter Colorway ID"
                            onInput={({ currentTarget: { value } }) => setColorwayID(value)}
                        />
                    </Modal>)
                }
            ]}
        >
            <div className="flex flex-col gap-1 w-full -mt-4">
                {!store && (!colorwayObject || !colorwayID) && <>
                    <span className="dc-field-header">Signed in as</span>
                    <div className="flex items-center gap-2 w-fit">
                        <img src={authedUser.image as string} width={32} height={32} className="rounded-full" />
                        {authedUser.username}
                    </div>
                </>}
                <span className={`dc-field-header${duplicateError ? " dc-field-header-error" : ""}`}>Name{duplicateError ? <span className="dc-field-header-errormsg">
                    <span className="dc-field-header-errordiv">-</span>
                    A colorway with this name already exists
                </span> : <></>}</span>
                <input
                    type="text"
                    className="dc-textbox"
                    placeholder="Give your Colorway a name"
                    value={colorwayName}
                    autoFocus
                    onInput={e => setColorwayName(e.currentTarget.value)}
                />
                <span className="dc-field-header">Colors</span>
                <div className="flex gap-1 items-center justify-stretch">
                    <StaticContextMenu yPos="top" menu={<div className="flex flex-col p-1 gap-1.5">
                        <HexColorPicker className="rounded-sm" color={accent} onChange={setAccent} />
                        <input type="text" onChange={e => setAccent(e.currentTarget.value)} value={accent} className="w-50 px-4 outline-hidden rounded-md bg-primary-100 dark:bg-primary-600 flex py-2 text-black dark:text-primary-100 gap-1 text-center transition-all duration-300" />
                    </div>}>
                        {({ onClick, containerRef }) => {
                            return <div ref={containerRef} onClick={onClick} className="colorwaysSaveAsSwatch" style={{ backgroundColor: accent }}>Accent</div>;
                        }}
                    </StaticContextMenu>
                    <StaticContextMenu yPos="top" menu={<div className="flex flex-col p-1 gap-1.5">
                        <HexColorPicker className="rounded-sm" color={primary} onChange={setPrimary} />
                        <input type="text" onChange={e => setPrimary(e.currentTarget.value)} value={primary} className="w-50 px-4 outline-hidden rounded-md bg-primary-100 dark:bg-primary-600 flex py-2 text-black dark:text-primary-100 gap-1 text-center transition-all duration-300" />
                    </div>}>
                        {({ onClick, containerRef }) => {
                            return <div ref={containerRef} onClick={onClick} className="colorwaysSaveAsSwatch" style={{ backgroundColor: primary }}>Primary</div>;
                        }}
                    </StaticContextMenu>
                    <StaticContextMenu yPos="top" menu={<div className="flex flex-col p-1 gap-1.5">
                        <HexColorPicker className="rounded-sm" color={secondary} onChange={setSecondary} />
                        <input type="text" onChange={e => setSecondary(e.currentTarget.value)} value={secondary} className="w-50 px-4 outline-hidden rounded-md bg-primary-100 dark:bg-primary-600 flex py-2 text-black dark:text-primary-100 gap-1 text-center transition-all duration-300" />
                    </div>}>
                        {({ onClick, containerRef }) => {
                            return <div ref={containerRef} onClick={onClick} className="colorwaysSaveAsSwatch" style={{ backgroundColor: secondary }}>Secondary</div>;
                        }}
                    </StaticContextMenu>
                    <StaticContextMenu yPos="top" menu={<div className="flex flex-col p-1 gap-1.5">
                        <HexColorPicker className="rounded-sm" color={tertiary} onChange={setTertiary} />
                        <input type="text" onChange={e => setTertiary(e.currentTarget.value)} value={tertiary} className="w-50 px-4 outline-hidden rounded-md bg-primary-100 dark:bg-primary-600 flex py-2 text-black dark:text-primary-100 gap-1 text-center transition-all duration-300" />
                    </div>}>
                        {({ onClick, containerRef }) => {
                            return <div ref={containerRef} onClick={onClick} className="colorwaysSaveAsSwatch" style={{ backgroundColor: tertiary }}>Tertiary</div>;
                        }}
                    </StaticContextMenu>
                </div>
                {!store ? <>
                    {!offlineColorwayStores.length ? <button
                        className="dc-button dc-button-primary"
                        style={{ marginTop: "8px" }}
                        onClick={() => {
                            openModal(props => <NewStoreModal
                                modalProps={props}
                                offlineOnly
                                onOffline={async ({ name }) => {
                                    setOfflineColorwayStores(prev => [...prev, { name, presets: [], colorways: [] }]);
                                }} />);
                        }}
                    >
                        <PlusIcon width={14} height={14} style={{ boxSizing: "content-box" }} />
                        Create new store...
                    </button> : <div className="flex justify-between items-center">
                        <span style={{ marginTop: "8px" }} className={`dc-field-header${noStoreError ? " dc-field-header-error" : ""}`}>Source{noStoreError ? <span className="dc-field-header-errormsg">
                            <span className="dc-field-header-errordiv">-</span>
                            No store selected
                        </span> : <></>}</span>
                        <button onClick={() => openModal(props => <NewStoreModal
                            modalProps={props}
                            offlineOnly
                            onOffline={async ({ name }) => {
                                setOfflineColorwayStores(prev => [...prev, { name, presets: [], colorways: [] }]);
                            }} />)} className="dc-button dc-button-primary dc-button-icon dc-button-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-4">
                                <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
                            </svg>
                        </button>
                    </div>}
                    <div className="dc-selector">
                        {offlineColorwayStores.map((store, i) => <div
                            key={i}
                            className="dc-colorway"
                            aria-checked={storename === store.name}
                            onClick={() => {
                                setStorename(store.name);
                            }}>
                            <svg aria-hidden="true" role="img" width="24" height="24" viewBox="0 0 24 24">
                                <path fillRule="evenodd" clipRule="evenodd" d="M12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="currentColor" />
                                {storename === store.name && <circle cx="12" cy="12" r="5" className="radioIconForeground-3wH3aU" fill="currentColor" />}
                            </svg>
                            <div className="dc-label-wrapper">
                                <span className="dc-label">{store.name}</span>
                                <span className="dc-label dc-subnote dc-note">{(store.colorways || []).length} colorways • {(store.presets || []).length} presets</span>
                            </div>
                        </div>)}
                    </div>
                </> : null}
            </div>
        </Modal>;
    } else return <AuthenticationRequiredModal modalProps={modalProps} />;
}

