import { Dispatcher } from "@renderer/api";
import { JSX, useLayoutEffect, useRef, useState } from "react";

export default function StaticContextMenu({
    children,
    menu,
    xPos = "left",
    yPos = "bottom"
}: {
    children: (props: { onClick(e: React.MouseEvent<HTMLElement, MouseEvent>); containerRef: React.MutableRefObject<null>; }) => JSX.Element,
    menu: JSX.Element,
    xPos?: "left" | "right",
    yPos?: "top" | "bottom";
}) {
    const cont: any = useRef(null);
    return children({
        containerRef: cont,
        onClick: (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
            e.stopPropagation();
            Dispatcher.emit("OPEN_CONTEXT_MENU", {
                render() {
                    function Menu() {
                        const [pos, setPos] = useState({ x: 0, y: 0 });

                        useLayoutEffect(() => {
                            if (cont.current) {
                                setPos({
                                    x: (cont.current as any).getBoundingClientRect().x,
                                    y: (cont.current as any).getBoundingClientRect().y
                                });
                            }
                        }, []);

                        return <div className={`dc-contextmenu overflow-auto no-scrollbar !fixed`} onClick={e => e.stopPropagation()} style={{
                            top: `${yPos === "bottom" ? pos.y + cont.current.offsetHeight + 8 : window.innerHeight - pos.y - cont.current.offsetHeight - 8}px`,
                            maxHeight: `calc(100vh - 4px - ${yPos === "bottom" ? pos.y + cont.current.offsetHeight + 8 : window.innerHeight - pos.y - cont.current.offsetHeight - 8}px)`,
                            ...(xPos === "left" ? { left: `${pos.x}px` } : { right: `${window.innerWidth - pos.x - cont.current.offsetWidth}px` })
                        }}>
                            {menu}
                        </div>;
                    }
                    return <Menu />;
                }
            });
        }
    });
}
