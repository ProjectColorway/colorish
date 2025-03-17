import { createContext, ReactNode, useState } from "react";

const ModalsContext = createContext<ReactNode[]>([]);

export default function ({ children }: { children({ openModal }: { openModal(callback: (props: { onClose(): void; }) => ReactNode): void; }): ReactNode; }) {
    const [items, setItems] = useState<ReactNode[]>([]);
    return <ModalsContext.Provider value={items}>
        {children({
            openModal(callback: (props: { onClose(): void; }) => ReactNode) {
                const i = Number(items.length);
                const node = callback({
                    onClose() {
                        setItems(itms => {
                            return itms.filter((_, a) => a !== i);
                        });
                    }
                });
                setItems((itms) => {
                    return [...itms, node];
                });
            }
        })}
        <div
            className="fixed top-0 left-0 w-screen h-screen empty:pointer-events-none z-1000 flex justify-center bg-black/0 items-center transition duration-300 ease not-empty:bg-black/50 *:not-last:not-[.close-bg]:!hidden">
            {items.length >= 1 && <div className="absolute top-0 left-0 w-screen h-screen close-bg" onClick={() => {
                setItems(itms => itms.slice(0, itms.length - 1));
            }} />}
            {items}
        </div>
    </ModalsContext.Provider>;
}
