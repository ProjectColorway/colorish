import { Dispatch, SetStateAction } from "react";

import { Hooks, Manager } from "../api";
import { Colorway } from "../types";
import StaticOptionsMenu from "./StaticOptionsMenu";
import { setContext } from "@renderer/api/Contexts";

export default function ({
    setShowSpinner
}: {
    setShowSpinner: Dispatch<SetStateAction<boolean>>;
}) {
    const [colorwaySourceFiles] = Hooks.useContextualState("colorwaySourceFiles");
    const [connectedApps] = Hooks.useContextualState("connectedApps");
    async function onReload_internal() {
        setShowSpinner(true);

        const responses: ({ appId: string, appName: string, url: string, name: string, response: Response; })[] = await Promise.all(
            ([
                ...colorwaySourceFiles.map(s => ({ ...s, appId: "this-manager", appName: "This Manager" })),
                ...connectedApps.filter(source => !colorwaySourceFiles.map(s => s.url).includes(source.url)).map(app => app.online.map(s => ({ ...s, appId: Object.values(app.boundKey)[0], appName: Manager.getClientDisplayName(Object.values(app.boundKey)[0] as string) }))).flat().map(s => ({ name: s.name, url: s.url, appName: s.appName, appId: s.appId } as { appId: string, appName: string, url: string, name: string; }))
            ] as { appId: string, appName: string, url: string, name: string; }[]).map(async source => ({ ...source, response: await fetch(source.url) }))
        );

        setContext("colorwayData", await Promise.all(
            responses.map(async res => ({ type: "online", source: res?.name, colorways: (await res?.response.json()).colorways, appName: res?.appName, appId: res?.appId }))
        ) as { type: "online" | "offline", source: string, colorways: Colorway[], appName: string, appId: string; }[], false);

        setShowSpinner(false);
    }

    return <StaticOptionsMenu menu={<button onClick={() => onReload_internal()} className="dc-contextmenu-item">
        Force Refresh
        <svg
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            width="18"
            height="18"
            style={{ boxSizing: "content-box", marginLeft: "8px" }}
            viewBox="0 0 24 24"
            fill="currentColor"
        >
            <rect
                y="0"
                fill="none"
                width="24"
                height="24"
            />
            <path
                d="M6.351,6.351C7.824,4.871,9.828,4,12,4c4.411,0,8,3.589,8,8h2c0-5.515-4.486-10-10-10 C9.285,2,6.779,3.089,4.938,4.938L3,3v6h6L6.351,6.351z"
            />
            <path
                d="M17.649,17.649C16.176,19.129,14.173,20,12,20c-4.411,0-8-3.589-8-8H2c0,5.515,4.486,10,10,10 c2.716,0,5.221-1.089,7.062-2.938L21,21v-6h-6L17.649,17.649z"
            />
        </svg>
    </button>}>
        {({ onClick }) => <button className="dc-contextmenu-item" onContextMenu={onClick} onClick={() => onReload_internal()}>
            Refresh
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-4.5">
                <path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 0 1-9.201 2.466l-.312-.311h2.433a.75.75 0 0 0 0-1.5H3.989a.75.75 0 0 0-.75.75v4.242a.75.75 0 0 0 1.5 0v-2.43l.31.31a7 7 0 0 0 11.712-3.138.75.75 0 0 0-1.449-.39Zm1.23-3.723a.75.75 0 0 0 .219-.53V2.929a.75.75 0 0 0-1.5 0V5.36l-.31-.31A7 7 0 0 0 3.239 8.188a.75.75 0 1 0 1.448.389A5.5 5.5 0 0 1 13.89 6.11l.311.31h-2.432a.75.75 0 0 0 0 1.5h4.243a.75.75 0 0 0 .53-.219Z" clipRule="evenodd" />
            </svg>
        </button>}
    </StaticOptionsMenu>;
}
