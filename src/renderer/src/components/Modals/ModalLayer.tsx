import { Dispatcher, Parsers } from "@renderer/api";
import { Fragment, ReactNode, useEffect, useState } from "react";

export default function () {
    const [items, setItems] = useState<{ [key: string]: ReactNode; }>({});

    function closeModal({ id: iid }: { id?: string; }) {
        const id = iid || Object.keys(items)[Object.keys(items).length - 1];
        if (items[id]) {
            setItems(itms => {
                const list = { ...itms };
                delete list[id];
                return list;
            });
        }
    }

    useEffect(() => {
        function openModal({ render }: { render(props: { onClose(): void; }): ReactNode; }) {
            const id = Parsers.guidGenerator();
            const node = render({
                onClose() {
                    setItems(itms => {
                        const list = { ...itms };
                        delete list[id];
                        return list;
                    });
                }
            });
            setItems(itms => {
                return { ...itms, [id]: node };
            });
        }

        Dispatcher.addListener("OPEN_MODAL", openModal);
        Dispatcher.addListener("CLOSE_MODAL", closeModal);

        return () => {
            Dispatcher.removeListener("OPEN_MODAL", openModal);
            Dispatcher.removeListener("CLOSE_MODAL", closeModal);
        };
    }, []);

    return <div
        className="fixed top-0 left-0 w-screen h-screen empty:pointer-events-none z-1000 flex justify-center bg-black/0 items-end transition duration-300 ease not-empty:bg-black/50 *:not-last:not-[.close-bg]:!hidden">
        {Object.values(items).length >= 1 && <div className="absolute top-0 left-0 w-screen h-screen close-bg" onClick={() => {
            closeModal({});
        }} />}
        {Object.values(items).map((it, i) => <Fragment key={i}>{it}</Fragment>)}
    </div>;
}
