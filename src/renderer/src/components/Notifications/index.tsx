import { Dispatcher, Logger, Parsers } from "@renderer/api";
import { Fragment, ReactNode, useEffect, useState } from "react";

function Notification({ msg, actions, closeNotification }: { msg: string, actions: React.ReactNode, closeNotification(): void; }) {
    return <div className="rounded-xl bg-primary-600 shadow-xl shadow-primary-800 border border-primary-400 flex items-center justify-between w-100 py-2 px-4 gap-4 animate-notification">
        <span className="text-white text-lg">{msg}</span>
        <div className="flex items-center gap-2">
            {actions}
            <svg onClick={() => closeNotification()} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-4 cursor-pointer text-white">
                <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
        </div>
    </div>;
}

export default function () {
    const logger = new Logger("NotificationsLayer");
    const [items, setItems] = useState<{ [key: string]: ReactNode; }>({});

    function closeNotif({ id: iid }: { id?: string; }) {
        const id = iid || Object.keys(items)[Object.keys(items).length - 1];
        if (items[id]) {
            setItems((itms) => {
                const list = { ...itms };
                delete list[id];
                return list;
            });
        }
    }

    function openNotification({ msg, actions }: { msg: string, actions?: React.ReactNode; }) {
        const id = Parsers.guidGenerator();
        const node = <Notification closeNotification={() => {
            setItems((itms) => {
                const list = { ...itms };
                delete list[id];
                return list;
            });
        }} msg={msg} actions={actions} key={id} />;
        setItems((itms) => {
            return { ...itms, [id]: node };
        });
        setTimeout(() => {
            try {
                setItems((itms) => {
                    const list = { ...itms };
                    delete list[id];
                    return list;
                });
            } catch (e) {
                logger.warn(e);
            }
        }, 5000);
    }

    useEffect(() => {
        Dispatcher.addListener("OPEN_NOTIFICATION", openNotification);
        Dispatcher.addListener("CLOSE_NOTIFICATION", closeNotif);

        return () => {
            Dispatcher.removeListener("OPEN_NOTIFICATION", openNotification);
            Dispatcher.removeListener("CLOSE_NOTIFICATION", closeNotif);
        };
    }, []);

    return <div
        className="fixed gap-2 top-0 left-0 w-screen h-screen pointer-events-none *:pointer-events-auto z-1000 flex justify-end items-end p-4 flex-col">
        {Object.values(items).map((it, i) => <Fragment key={i}>{it}</Fragment>)}
    </div>;
}
