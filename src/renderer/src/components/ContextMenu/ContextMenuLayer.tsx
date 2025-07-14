import { Dispatcher } from "@renderer/api";
import { ReactNode, useEffect, useState } from "react";

export default function () {
    const [item, setItem] = useState<ReactNode>(<></>);

    useEffect(() => {
        function openContextMenu({ render }: { render(): ReactNode; }) {
            setItem(render());
        }

        Dispatcher.addListener("OPEN_CONTEXT_MENU", openContextMenu);
        Dispatcher.addListener("CLOSE_CONTEXT_MENU", () => setItem(<></>));
        window.addEventListener("click", () => setItem(<></>));

        return () => {
            Dispatcher.removeListener("OPEN_CONTEXT_MENU", openContextMenu);
            Dispatcher.removeListener("CLOSE_CONTEXT_MENU", () => setItem(<></>));
            window.removeEventListener("click", () => setItem(<></>));
        };
    }, []);

    return <div
        className="fixed gap-2 top-0 left-0 w-screen h-screen pointer-events-none *:pointer-events-auto z-1000 flex justify-start items-end p-4 flex-col-reverse">
        {item}
    </div>;
}
