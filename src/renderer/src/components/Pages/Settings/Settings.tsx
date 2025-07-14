import { initContexts, setContext, setContexts, unsavedContexts } from "@renderer/api/Contexts";
import { chooseFile, saveFile } from "@renderer/api/Fs";
import { useContexts } from "@renderer/api/Hooks";
import { openModal } from "@renderer/api/Modals";
import FeaturePresenter from "@renderer/components/FeaturePresenter";
import { CogIcon, PalleteIcon, WirelessIcon } from "@renderer/components/Icons";
import Modal from "@renderer/components/Modals/Modal";
import openChangelogModal from "@renderer/components/Modals/openChangelogModal";
import Setting from "@renderer/components/Setting";
import { nullColorwayObj } from "@renderer/constants";
import { getAutoPresets } from "@renderer/css";
import { useEffect, useState } from "react";

export default function Settings() {
    const [osColor, setOsColor] = useState("5865f2");
    const contexts = useContexts();

    useEffect(() => {
        (async () => {
            setOsColor((await getSystemColor())["os-accent-color"].replaceAll("#", ""));
        })();

        onOsColorChanged(async () => {
            setOsColor((await getSystemColor())["os-accent-color"].replaceAll("#", ""));
        });
    }, []);

    return <div className="flex flex-col gap-1 p-3">
        <span className="dc-field-header">App theme</span>
        <Setting divider>
            <div className="flex gap-0.5 flex-col">
                <div
                    className="colorway-pure w-full rounded-t-2xl"
                    aria-checked={contexts.colorwaysAppTheme === "light"}
                    onClick={() => {
                        setContext("colorwaysAppTheme", "light");
                    }}
                >
                    <div className="dc-color-swatch bg-white" />
                    <div className="dc-label-wrapper">
                        <span className="dc-label">Light</span>
                    </div>
                </div>
                <div
                    className="colorway-pure w-full"
                    aria-checked={contexts.colorwaysAppTheme === "dark"}
                    onClick={() => {
                        setContext("colorwaysAppTheme", "dark");
                    }}
                >
                    <div className="dc-color-swatch bg-primary-500" />
                    <div className="dc-label-wrapper">
                        <span className="dc-label">Dark</span>
                    </div>
                </div>
                <div
                    className="colorway-pure w-full rounded-b-2xl"
                    aria-checked={contexts.colorwaysAppTheme === "black"}
                    onClick={() => {
                        setContext("colorwaysAppTheme", "black");
                    }}
                >
                    <div className="dc-color-swatch bg-black" />
                    <div className="dc-label-wrapper">
                        <span className="dc-label">Midnight</span>
                        <span className="dc-label dc-subnote dc-note">Recommended for OLED screens</span>
                    </div>
                </div>
            </div>
        </Setting>
        <span className="dc-field-header">Auto Colors</span>
        <Setting divider>
            <div className="flex flex-col gap-0.5">
                {Object.values(getAutoPresets(osColor)).map(({ name, id, colors }, i: number) => <div
                    className="colorway-pure w-full first:rounded-t-2xl"
                    aria-checked={contexts.activeAutoPreset === id}
                    key={i}
                    onClick={() => {
                        setContext("activeAutoPreset", id);
                    }}
                >
                    <div className="dc-color-swatch">
                        <div className="dc-color-swatch-part" style={{ backgroundColor: colors.accent }} />
                        <div className="dc-color-swatch-part" style={{ backgroundColor: colors.primary }} />
                        <div className="dc-color-swatch-part" style={{ backgroundColor: colors.secondary }} />
                        <div className="dc-color-swatch-part" style={{ backgroundColor: colors.tertiary }} />
                    </div>
                    <div className="dc-label-wrapper">
                        <span className="dc-label">{name}</span>
                    </div>
                </div>)}
            </div>
            <div
                className="colorway-pure w-full rounded-b-2xl mt-0.5 !px-4 !py-2 !min-h-0 pointer-events-none"
            >
                <div className="dc-label-wrapper">
                    <span className="dc-label">The auto colorway allows you to turn your system's accent color into a fully fledged colorway through various Auto Presets.</span>
                </div>
            </div>
        </Setting>
        <span className="dc-field-header">Storage</span>
        <Setting divider>
            <div className="flex flex-col gap-0.5">
                <div className="colorway-pure rounded-t-2xl" onClick={() => {
                    const data = { ...contexts };

                    unsavedContexts.forEach(key => {
                        delete data[key];
                    });

                    saveFile(new File([JSON.stringify(data)], "Colorish.settings.json", { type: "application/json" }));
                }}>
                    <div className="dc-label-wrapper">
                        <span className="dc-label">Export Settings</span>
                        <span className="dc-label dc-sublabel dc-note">Export your Colorish settings to a .json file.</span>
                    </div>
                </div>
                <div className="colorway-pure colorway-danger" onClick={() => {
                    openModal(props => <Modal
                        modalProps={props}
                        title="Import Settings for Colorish"
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
                }}>
                    <div className="dc-label-wrapper">
                        <span className="dc-label">Import Settings</span>
                        <span className="dc-label dc-sublabel dc-note">Import your Colorish/DiscordColorways settings from a .json file.</span>
                    </div>
                </div>
                <div className="colorway-pure colorway-danger rounded-b-2xl" onClick={() => {
                    openModal(props => <Modal
                        modalProps={props}
                        title="Reset Colorish"
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
                        confirmMsg="Reset Colorish"
                        type="danger"
                    >
                        Are you sure you want to reset Colorish to its default settings? This will delete:
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
                }}>
                    <div className="dc-label-wrapper">
                        <span className="dc-label">Reset Colorish</span>
                        <span className="dc-label dc-sublabel dc-note">Reset all settings to default.</span>
                    </div>
                </div>
            </div>
            {/* <div className="flex w-full items-center gap-1">
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
                    onClick={() => {
                        openModal(props => <Modal
                            modalProps={props}
                            title="Reset Colorish"
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
                            confirmMsg="Reset Colorish"
                            type="danger"
                        >
                            Are you sure you want to reset Colorish to its default settings? This will delete:
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
                    Reset Colorish
                </button>
            </div> */}
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
            Version {contexts.discordColorwaysData.version.split(".")[0]}{contexts.discordColorwaysData.version.split(".")[1] !== "0" ? `.${contexts.discordColorwaysData.version.split(".")[1]}` : ""}{contexts.discordColorwaysData.version.split(".")[2] !== "0" ? ` (Patch ${contexts.discordColorwaysData.version.split(".")[2]})` : ""} (Beta 2)
        </span>
        <div className="flex w-full items-center gap-1">
            <a role="link" target="_blank" className="dc-button dc-button-primary !h-fit" href="https://github.com/ProjectColorway/Colorish" rel="noreferrer">Colorish
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-4">
                    <path d="M12.232 4.232a2.5 2.5 0 0 1 3.536 3.536l-1.225 1.224a.75.75 0 0 0 1.061 1.06l1.224-1.224a4 4 0 0 0-5.656-5.656l-3 3a4 4 0 0 0 .225 5.865.75.75 0 0 0 .977-1.138 2.5 2.5 0 0 1-.142-3.667l3-3Z" />
                    <path d="M11.603 7.963a.75.75 0 0 0-.977 1.138 2.5 2.5 0 0 1 .142 3.667l-3 3a2.5 2.5 0 0 1-3.536-3.536l1.225-1.224a.75.75 0 0 0-1.061-1.06l-1.224 1.224a4 4 0 1 0 5.656 5.656l3-3a4 4 0 0 0-.225-5.865Z" />
                </svg>
            </a>
            <a role="link" target="_blank" className="dc-button dc-button-primary !h-fit" href="https://github.com/DaBluLite/ProjectColorway" rel="noreferrer">Project Colorway
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-4">
                    <path d="M12.232 4.232a2.5 2.5 0 0 1 3.536 3.536l-1.225 1.224a.75.75 0 0 0 1.061 1.06l1.224-1.224a4 4 0 0 0-5.656-5.656l-3 3a4 4 0 0 0 .225 5.865.75.75 0 0 0 .977-1.138 2.5 2.5 0 0 1-.142-3.667l3-3Z" />
                    <path d="M11.603 7.963a.75.75 0 0 0-.977 1.138 2.5 2.5 0 0 1 .142 3.667l-3 3a2.5 2.5 0 0 1-3.536-3.536l1.225-1.224a.75.75 0 0 0-1.061-1.06l-1.224 1.224a4 4 0 1 0 5.656 5.656l3-3a4 4 0 0 0-.225-5.865Z" />
                </svg>
            </a>
            <button className="dc-button dc-button-primary !h-fit" onClick={() => openChangelogModal()}>View Changelog</button>
        </div>
    </div>;
}
