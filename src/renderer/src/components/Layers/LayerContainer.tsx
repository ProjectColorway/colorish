import { Dispatcher, Parsers } from "@renderer/api";
import { Fragment, ReactNode, useEffect, useState } from "react";

export default function () {
    const [items, setItems] = useState<{ [key: string]: ReactNode; }>({});

    function closeModal({ id: iid }: { id?: string; }) {
        const id = iid || Object.keys(items)[Object.keys(items).length - 1];
        if (items[id]) {
            setItems((itms) => {
                const list = { ...itms };
                delete list[id];
                return list;
            });
        }
    }

    useEffect(() => {
        function openModal({ render }: { render(props: { onClose(): void, id: string; }): ReactNode; }) {
            const id = Parsers.guidGenerator();
            const node = render({
                id,
                onClose() {
                    setItems((itms) => {
                        const list = { ...itms };
                        delete list[id];
                        return list;
                    });
                }
            });
            setItems((itms) => {
                return { ...itms, [id]: node };
            });
        }

        function onKeyDown(e: KeyboardEvent) {
            if (e.code === "Escape") closeModal({});
        }

        window.addEventListener("keydown", onKeyDown);

        Dispatcher.addListener("OPEN_LAYER", openModal);
        Dispatcher.addListener("CLOSE_LAYER", closeModal);

        return () => {
            window.removeEventListener("keydown", onKeyDown);

            Dispatcher.removeListener("OPEN_LAYER", openModal);
            Dispatcher.removeListener("CLOSE_LAYER", closeModal);
        };
    }, []);

    return <div
        className="fixed top-0 left-0 w-screen h-screen empty:pointer-events-none z-1000 flex justify-center bg-black/0 items-center transition duration-300 ease">
        {Object.values(items).map((it, i) => <Fragment key={i}>{it}</Fragment>)}
    </div>;
}
