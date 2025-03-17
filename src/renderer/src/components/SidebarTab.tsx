/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Tabs } from "../types";
import { IconProps } from "./Icons";

export default function ({ id, title, Icon, bottom, onSelect, activeTab, expanded = false, onContextMenu = () => { }, onMouseEnter = () => { }, onMouseLeave = () => { } }: { id: Tabs, title?: string, Icon: (props: React.PropsWithChildren<IconProps>) => JSX.Element, bottom?: boolean, onSelect: (id: Tabs, e: React.MouseEvent<HTMLDivElement>) => void, activeTab: Tabs, expanded?: boolean, onContextMenu?: React.MouseEventHandler<HTMLDivElement>, onMouseEnter?: React.MouseEventHandler<HTMLDivElement>, onMouseLeave?: React.MouseEventHandler<HTMLDivElement>; }) {
    return <div
        className={`region-no-drag flex shrink-0 gap-2 relative z-10 h-full place-content-center px-6 transition duration-100 items-center focus:outline-none text-primary-300 cursor-pointer select-none dark:text-primary-300 ${(id === activeTab ? " text-primary-800 dark:text-white" : "")}`}
        onClick={e => {
            onSelect(id, e);
        }}
        style={{
            ...(bottom ? { marginTop: "auto" } : {}),
            ...(expanded ? { justifyContent: "start" } : {}),
        }}
        onContextMenu={onContextMenu}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
    >
        <Icon width={18} height={18} /><span style={{ marginLeft: "8px" }}>{title}</span>
    </div>;
}
