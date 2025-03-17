import { useState } from "react";
import { Dispatcher } from "../../api";
import { initContexts, setContext, setContexts, unsavedContexts } from "../../api/Contexts";
import { useContexts, useContextualState } from "../../api/Hooks";
import { openModal } from "../../api/Modals";
import { nullColorwayObj } from "../../constants";
import { getAutoPresets } from "../../css";
import { ColorwayObject, Context, ContextKey } from "../../types";
import ComboTextBox from "../ComboTextBox";
import FeaturePresenter from "../FeaturePresenter";
import { CogIcon, DownloadIcon, PalleteIcon, WirelessIcon } from "../Icons";
import Modal from "../Modal";
import SelectionCircle from "../SelectionCircle";
import Setting from "../Setting";
import TabBar from "../TabBar";
import Tooltip from "../Tooltip";
import { chooseFile, saveFile } from "@renderer/api/Fs";
import { colorToHex } from "@renderer/api/Colors";

export default function ({ tab = "Settings" }: { tab: string; }) {
    const [active, setActive] = useState(tab);

    return <TabBar
        active={active}
        container={({ children }) => <div className="dc-page-header">{children}</div>}
        items={[
            {
                name: "Settings",
                component: () => <Settings />
            },
            {
                name: "History",
                component: () => <History />
            }
        ]}
        onChange={setActive}
    />;
}

function History() {
    const [searchValue, setSearchValue] = useState("");
    const [colorwayUsageMetrics] = useContextualState("colorwayUsageMetrics");
    return <>
        <ComboTextBox
            value={searchValue}
            onInput={setSearchValue}
            placeholder="Search for a Colorway..."

        >
            <button
                className="dc-button dc-button-primary dc-button-icon"
                style={{ flexShrink: "0", width: "fit-content" }}
                onClick={async () => {
                    saveFile(new File([JSON.stringify(colorwayUsageMetrics)], "colorways_usage_metrics.json", { type: "application/json" }));
                }}
            >
                <DownloadIcon width={14} height={14} />
            </button>
        </ComboTextBox>
        <div className="dc-selector" style={{ flexGrow: "1" }}>
            {colorwayUsageMetrics.filter(({ id }) => id?.toLowerCase().includes(searchValue.toLowerCase())).map(color => <div className="dc-colorway">
                <div className="dc-label-wrapper">
                    <span className="dc-label">{color.id}</span>
                    <span className="dc-label dc-subnote dc-note">in {color.source} • {color.uses} uses</span>
                </div>
            </div>)}
        </div>
    </>;
}

function Settings() {
    const contexts = useContexts();

    return <div className="flex flex-col gap-1 p-3">
        <span className="dc-field-header">App theme</span>
        <Setting divider>
            <div style={{
                display: "flex",
                gap: "24px"
            }}>
                <Tooltip
                    text="Light"
                    position="top"
                >
                    {({ onClick, onMouseEnter, onMouseLeave }) => <div className="dc-color-swatch-selectable">
                        <div
                            className="dc-color-swatch bg-white"
                            onMouseEnter={onMouseEnter}
                            onMouseLeave={onMouseLeave}
                            onClick={e => {
                                onClick(e);
                                setContext("colorwaysAppTheme", "light");
                            }}
                        />
                        {contexts.colorwaysAppTheme === "light" ? <SelectionCircle /> : null}
                    </div>}
                </Tooltip>
                <Tooltip
                    text="Dark"
                    position="top"
                >
                    {({ onClick, onMouseEnter, onMouseLeave }) => <div className="dc-color-swatch-selectable">
                        <div
                            className="dc-color-swatch bg-primary-600"
                            onMouseEnter={onMouseEnter}
                            onMouseLeave={onMouseLeave}
                            onClick={e => {
                                onClick(e);
                                setContext("colorwaysAppTheme", "dark");
                            }}
                        />
                        {contexts.colorwaysAppTheme === "dark" ? <SelectionCircle /> : null}
                    </div>}
                </Tooltip>
                <Tooltip
                    text="Black"
                    position="top"
                >
                    {({ onClick, onMouseEnter, onMouseLeave }) => <div className="dc-color-swatch-selectable">
                        <div
                            className="dc-color-swatch bg-primary-900"
                            onMouseEnter={onMouseEnter}
                            onMouseLeave={onMouseLeave}
                            onClick={e => {
                                onClick(e);
                                setContext("colorwaysAppTheme", "black");
                            }}
                        />
                        {contexts.colorwaysAppTheme === "black" ? <SelectionCircle /> : null}
                    </div>}
                </Tooltip>
            </div>
        </Setting>
        <span className="dc-field-header">Auto Colors</span>
        <Setting divider>
            <div style={{
                display: "flex",
                gap: "24px"
            }}>
                {Object.values(getAutoPresets("5865f2")).map(({ name, id, colors }) => <Tooltip
                    text={name}
                    position="top"
                >
                    {({ onClick, onMouseEnter, onMouseLeave }) => <div className="dc-color-swatch-selectable">
                        <div
                            className="dc-color-swatch"
                            onMouseEnter={onMouseEnter}
                            onMouseLeave={onMouseLeave}
                            onClick={e => {
                                onClick(e);
                                setContext("activeAutoPreset", id);

                                if (contexts.activeColorwayObject.id === "Auto" && contexts.activeColorwayObject.sourceType === "auto") {
                                    const { colors } = getAutoPresets(colorToHex(getComputedStyle(document.body).getPropertyValue("--os-accent-color")).slice(0, 6))[id];
                                    const newObj: ColorwayObject = {
                                        id: "Auto",
                                        sourceType: "auto",
                                        source: null,
                                        colors: colors
                                    };
                                    if (!contexts.isConnected) {
                                        setContext("activeColorwayObject", newObj);
                                    } else {
                                        if (!contexts.hasManagerRole) {
                                        } else {
                                            Dispatcher.emit("COLORWAYS_SEND_COLORWAY", {
                                                active: newObj
                                            });
                                        }
                                    }
                                }
                            }}
                        >
                            <div className="dc-color-swatch-part" style={{ backgroundColor: colors.accent }} />
                            <div className="dc-color-swatch-part" style={{ backgroundColor: colors.primary }} />
                            <div className="dc-color-swatch-part" style={{ backgroundColor: colors.secondary }} />
                            <div className="dc-color-swatch-part" style={{ backgroundColor: colors.tertiary }} />
                        </div>
                        {contexts.activeAutoPreset === id ? <SelectionCircle /> : null}
                    </div>}
                </Tooltip>)}
            </div>
            <span className="dc-note">The auto colorway allows you to turn your system's accent color into a fully fledged colorway through various Auto Presets.</span>
        </Setting>
        <span className="dc-field-header">Manage Settings...</span>
        <Setting divider>
            <div style={{
                display: "flex",
                flexDirection: "row",
                width: "100%",
                alignItems: "center",
                cursor: "pointer"
            }}>
                <button
                    className="dc-button dc-button-primary"
                    onClick={() => {
                        const data = { ...contexts };

                        unsavedContexts.forEach(key => {
                            delete data[key];
                        });

                        saveFile(new File([JSON.stringify(data)], "DiscordColorways.settings.json", { type: "application/json" }));
                    }}
                >
                    Export Settings...
                </button>
                <button
                    className="dc-button dc-button-danger"
                    style={{
                        marginLeft: "8px"
                    }}
                    onClick={() => {
                        openModal(props => <Modal
                            modalProps={props}
                            title="Import Settings for DiscordColorways"
                            onFinish={async ({ closeModal }) => {
                                const file = await chooseFile("application/json");
                                if (!file) return;

                                const reader = new FileReader();
                                reader.onload = async () => {
                                    const settings: { [key in ContextKey]: Context<key>; } = JSON.parse(reader.result as string) as { [key in ContextKey]: Context<key>; };
                                    Object.keys(settings).forEach(key => {
                                        setContext(key as ContextKey, settings[key], !unsavedContexts.includes(key));
                                    });

                                    closeModal();

                                    initContexts();
                                };
                            }}
                            confirmMsg="Import File..."
                            type="danger"
                        >
                            Are you sure you want to import a settings file? Current settings will be overwritten!
                        </Modal>);
                    }}
                >
                    Import from JSON file...
                </button>
                <button
                    className="dc-button dc-button-danger"
                    style={{
                        marginLeft: "8px"
                    }}
                    onClick={() => {
                        openModal(props => <Modal
                            modalProps={props}
                            title="Reset DiscordColorways"
                            onFinish={async ({ closeModal }) => {
                                const resetValues: ([ContextKey, Context<ContextKey>] | [ContextKey, Context<ContextKey>, boolean])[] = [
                                    ["colorwaySourceFiles", []],
                                    ["customColorways", []],
                                    ["activeColorwayObject", nullColorwayObj],
                                    ["activeAutoPreset", "hueRotation"],
                                    ["colorwayData", [], false],
                                    ["colorwayUsageMetrics", []],
                                    ["colorwaysManagerDoAutoconnect", true],
                                    ["colorwaysManagerAutoconnectPeriod", 3000],
                                    ["hasManagerRole", false, false],
                                    ["isConnected", false, false],
                                    ["boundKey", { "00000000": `discord.${Math.random().toString(16).slice(2)}.${new Date().getUTCMilliseconds()}` }, false],
                                    ["colorwaysBoundManagers", []],
                                ];

                                setContexts(...resetValues);
                                initContexts();
                                closeModal();
                            }}
                            confirmMsg="Reset Plugin"
                            type="danger"
                        >
                            Are you sure you want to reset DiscordColorways to its default settings? This will delete:
                            <FeaturePresenter style={{
                                marginTop: "16px"
                            }}
                                items={[
                                    {
                                        Icon: WirelessIcon,
                                        title: "Your Online and Offline Sources"
                                    },
                                    {
                                        Icon: PalleteIcon,
                                        title: "Your Colorways and presets"
                                    },
                                    {
                                        Icon: CogIcon,
                                        title: "Your Settings"
                                    }
                                ]}
                            />
                        </Modal>);
                    }}
                >
                    Reset DiscordColorways
                </button>
            </div>
        </Setting>
        <span className="dc-field-header">About</span>
        <h1 className="dc-wordmark">
            Colorish
        </h1>
        <span
            className="text-black dark:text-white"
            style={{
                fontWeight: 500,
                fontSize: "14px"
            }}
        >by Project Colorway</span>
        <span
            className="dc-note"
            style={{
                fontWeight: 500,
                fontSize: "14px",
                marginBottom: "12px"
            }}
        >
            Version {contexts.discordColorwaysData.version.split(".")[0]}{contexts.discordColorwaysData.version.split(".")[1] !== "0" ? `.${contexts.discordColorwaysData.version.split(".")[1]}` : ""}{contexts.discordColorwaysData.version.split(".")[2] !== "0" ? ` (Patch ${contexts.discordColorwaysData.version.split(".")[2]})` : ""} (Beta 1)
        </span>
        <div style={{
            display: "flex",
            flexDirection: "row",
            width: "100%",
            alignItems: "center",
            cursor: "pointer"
        }}>
            <a role="link" target="_blank" className="dc-button dc-button-primary" style={{ width: "fit-content" }} href="https://github.com/ProjectColorway/Colorish">Colorish <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-4">
                <path d="M12.232 4.232a2.5 2.5 0 0 1 3.536 3.536l-1.225 1.224a.75.75 0 0 0 1.061 1.06l1.224-1.224a4 4 0 0 0-5.656-5.656l-3 3a4 4 0 0 0 .225 5.865.75.75 0 0 0 .977-1.138 2.5 2.5 0 0 1-.142-3.667l3-3Z" />
                <path d="M11.603 7.963a.75.75 0 0 0-.977 1.138 2.5 2.5 0 0 1 .142 3.667l-3 3a2.5 2.5 0 0 1-3.536-3.536l1.225-1.224a.75.75 0 0 0-1.061-1.06l-1.224 1.224a4 4 0 1 0 5.656 5.656l3-3a4 4 0 0 0-.225-5.865Z" />
            </svg>
            </a>
            <a role="link" target="_blank" className="dc-button dc-button-primary" style={{ width: "fit-content", marginLeft: "8px" }} href="https://github.com/DaBluLite/ProjectColorway">Project Colorway <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-4">
                <path d="M12.232 4.232a2.5 2.5 0 0 1 3.536 3.536l-1.225 1.224a.75.75 0 0 0 1.061 1.06l1.224-1.224a4 4 0 0 0-5.656-5.656l-3 3a4 4 0 0 0 .225 5.865.75.75 0 0 0 .977-1.138 2.5 2.5 0 0 1-.142-3.667l3-3Z" />
                <path d="M11.603 7.963a.75.75 0 0 0-.977 1.138 2.5 2.5 0 0 1 .142 3.667l-3 3a2.5 2.5 0 0 1-3.536-3.536l1.225-1.224a.75.75 0 0 0-1.061-1.06l-1.224 1.224a4 4 0 1 0 5.656 5.656l3-3a4 4 0 0 0-.225-5.865Z" />
            </svg>
            </a>
        </div>
    </div>;
}
