import { Tabs } from "@renderer/types";
import { useState } from "react";

import { CloseIcon, CogIcon, CopyIcon, LinkIcon } from "../Icons";
import { History, Settings } from "../Pages";
import { Sources } from "../Pages/Settings";
import SidebarTab from "../SidebarTab";
import Layer from "./Layer";

export default function SettingsLayer({ layerProps }: { layerProps: { onClose(): void, id: string; }; }) {
    const [activeTab, setActiveTab] = useState<Tabs>(Tabs.Settings);

    return <Layer>
        <div className="flex w-max flex-col items-center gap-1 transition-all min-w-60 bg-second-layer-thin">
            <SidebarTab
                activeTab={activeTab}
                onSelect={id => {
                    setActiveTab(id);
                }}
                Icon={CogIcon}
                id={Tabs.Settings}
                title="Settings"
            />
            <SidebarTab
                activeTab={activeTab}
                onSelect={id => {
                    setActiveTab(id);
                }}
                Icon={LinkIcon}
                id={Tabs.Sources}
                title="Sources"
            />
            <SidebarTab
                activeTab={activeTab}
                onSelect={id => {
                    setActiveTab(id);
                }}
                Icon={CopyIcon}
                id={Tabs.History}
                title="History"
            />
        </div>
        <div className="flex flex-col w-full h-full">
            <div className="flex items-center justify-end max-w-300 mx-auto w-full">
                <div className="dc-button dc-button-primary dc-button-icon" onClick={() => layerProps.onClose()}><CloseIcon /></div>
            </div>
            <div className="flex flex-col max-w-300 mx-auto use-scrollbar gap-1 w-full h-[calc(100%-32px)] overflow-y-auto">
                {activeTab === Tabs.Settings ? <Settings /> : <></>}
                {activeTab === Tabs.Sources ? <Sources /> : <></>}
                {activeTab === Tabs.History ? <History /> : <></>}
            </div>
        </div>
    </Layer>;
}
