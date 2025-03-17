import { guidGenerator } from "@renderer/api";
import { createContext, ReactNode, useState } from "react";

const NotificationsContext = createContext<{ [key: string]: ReactNode; }>({});

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

export default function ({ children }: { children({ showNotification }: { showNotification(msg: string, actions?: React.ReactNode): void; }): ReactNode; }) {
    const [items, setItems] = useState<{ [key: string]: ReactNode; }>({});
    return <NotificationsContext.Provider value={items}>
        {children({
            showNotification(msg: string, actions?: React.ReactNode) {
                let uuid = guidGenerator();
                while (Object.keys(items).includes(uuid)) {
                    uuid = guidGenerator();
                }
                setItems((itms) => {
                    return {
                        ...itms,
                        [uuid]: <Notification closeNotification={() => {
                            setItems(itms => {
                                const newItms = {};
                                Object.keys(itms).filter(key => key !== uuid).map(key => {
                                    newItms[key] = itms[key];
                                });
                                return newItms;
                            });
                        }} msg={msg} actions={actions} key={uuid} />
                    };
                });
                setTimeout(() => {
                    try {
                        setItems(itms => {
                            const newItms = {};
                            Object.keys(itms).filter(key => key !== uuid).map(key => {
                                newItms[key] = itms[key];
                            });
                            return newItms;
                        });
                    } catch (e) {
                        console.warn(e);
                    }
                }, 5000);
            }
        })}
        <div
            className="fixed gap-2 top-0 left-0 w-screen h-screen pointer-events-none *:pointer-events-auto z-1000 flex justify-start items-end p-4 flex-col-reverse">
            {Object.values(items)}
        </div>
    </NotificationsContext.Provider>;
}
