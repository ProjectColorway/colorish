import { useState } from "react";
import { Tabs } from "../types";
import { CogIcon, SelectorsIcon, WidgetsPlusIcon } from "./Icons";
import Selector from "./Selector";
import SettingsPage from "./SettingsTabs/SettingsPage";
import SourceManager from "./SettingsTabs/SourceManager";
import SidebarTab from "./SidebarTab";
import SearchButton from "./SearchButton";

export default function ({
    tab = Tabs.Selector,
    subTab = "Colorways"
}: ({ tab?: Tabs.Selector; subTab?: "Colorways" | "Presets" | "Themes"; } |
{ tab?: Tabs.Settings; subTab?: "Settings" | "History"; } |
{ tab?: Tabs.Sources; subTab?: "Installed" | "Discover"; }
    )): JSX.Element | any {
    const [activeTab, setActiveTab] = useState<Tabs>(tab);
    const [activeSubTab, setActiveSubTab] = useState<string>(subTab);
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="flex flex-col h-[100vh]" >
            <div className="shrink-0 flex h-15 flex-row items-center justify-center gap-1 rounded-xl transition-all px-2 w-full region-drag">
                <div className="flex items-center">
                    <SidebarTab
                        activeTab={activeTab}
                        onSelect={id => {
                            setActiveTab(id);
                            setExpanded(false);
                            setActiveSubTab("Colorways");
                        }}
                        Icon={SelectorsIcon}
                        id={Tabs.Selector}
                        title="Change Colorway"
                        expanded={expanded}
                    />
                    <div className="pointer-events-none -mx-px h-4 w-px transition-all duration-200 select-none bg-primary-600 dark:bg-primary-200" />
                    <SidebarTab
                        activeTab={activeTab}
                        onSelect={id => {
                            setActiveTab(id);
                            setExpanded(false);
                            setActiveSubTab("Settings");
                        }}
                        Icon={CogIcon}
                        id={Tabs.Settings}
                        title="Settings"
                        expanded={expanded}
                    />
                    <div className="pointer-events-none -mx-px h-4 w-px transition-all duration-200 select-none bg-primary-600 dark:bg-primary-200" />
                    <SidebarTab
                        activeTab={activeTab}
                        onSelect={id => {
                            setActiveTab(id);
                            setExpanded(false);
                            setActiveSubTab("Installed");
                        }}
                        Icon={WidgetsPlusIcon}
                        id={Tabs.Sources}
                        title="Sources"
                        expanded={expanded}
                    />
                    {!dc_win && <SearchButton />}
                </div>
            </div>
            <div className="overflow-auto max-h-full p-1 gap-1 flex flex-col" style={{ width: "100%" }}>
                {activeTab === Tabs.Selector && <Selector />}
                {activeTab === Tabs.Sources && <SourceManager tab={activeSubTab} />}
                {activeTab === Tabs.Settings && <SettingsPage tab={activeSubTab} />}
            </div>
        </div>
    );
}
