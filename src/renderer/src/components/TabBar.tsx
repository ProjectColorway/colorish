/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

export default function ({
    items = [],
    container = ({ children }) => <>{children}</>,
    onChange,
    active = ""
}: {
    items: { name: string, component(): JSX.Element, button?(props: { active: string, onChange(id: string): void; }): JSX.Element; }[];
    container?({ children }): JSX.Element;
    onChange(tab: string): void;
    active: string;
}) {
    return <>
        {container({
            children: <div className="dc-menu-tabs">
                {items.map(item => {
                    return item.button ? item.button({ active, onChange }) : <div className={`dc-button ${active === item.name ? "dc-button-brand" : ""}`} onClick={() => onChange(item.name)}>{item.name}</div>;
                })}
            </div>
        })}
        {items.map(item => active === item.name ? item.component() : null)}
    </>;
}
