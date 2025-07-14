import { JSX } from "react";

import { Tabs } from "../types";
import { IconProps } from "./Icons";

export default function ({ id, title, Icon, onSelect, activeTab, onContextMenu = () => { }, onMouseEnter = () => { }, onMouseLeave = () => { } }: { id: Tabs, title?: string, Icon: (props: React.PropsWithChildren<IconProps>) => JSX.Element, onSelect: (id: Tabs, e: React.MouseEvent<HTMLDivElement>) => void, activeTab: Tabs, onContextMenu?: React.MouseEventHandler<HTMLDivElement>, onMouseEnter?: React.MouseEventHandler<HTMLDivElement>, onMouseLeave?: React.MouseEventHandler<HTMLDivElement>; }) {
    return <div
        className={`region-no-drag rounded-lg px-3 py-1.5 min-w-(--custom-button-button-sm-width) min-h-(--custom-button-button-sm-height) w-full flex shrink-0 gap-2 relative z-10 justify-start transition-all duration-200 ease items-center focus:outline-none cursor-pointer select-none hover:bg-primary-200 hover:dark:bg-primary-700 text-primary-800 dark:text-white${(id === activeTab ? " !bg-primary-100 dark:!bg-primary-600 black:!bg-primary-800 shadow-glass" : "")}`}
        onClick={e => {
            onSelect(id, e);
        }}
        onContextMenu={onContextMenu}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
    >
        <Icon width={18} height={18} /><span style={{ marginLeft: "8px" }}>{title}</span>
    </div>;
}
