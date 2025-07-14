import { Dispatcher } from "@renderer/api";
import { JSX, useLayoutEffect, useRef, useState } from "react";

export default function ContextMenu({
    children,
    menu
}: {
    children: (props: { onContextMenu: React.MouseEventHandler<HTMLElement>; }) => JSX.Element,
    menu: React.ReactNode;
}) {
    return children({
        onContextMenu(e) {
            Dispatcher.emit("OPEN_CONTEXT_MENU", {
                render() {
                    function Menu() {
                        const targetRef = useRef(null);
                        const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

                        useLayoutEffect(() => {
                            if (targetRef.current) {
                                setDimensions({
                                    width: (targetRef.current as any).offsetWidth,
                                    height: (targetRef.current as any).offsetHeight
                                });
                            }
                        }, []);
                        return <div ref={targetRef} className={`dc-contextmenu overflow-auto no-scrollbar !fixed`} onClick={e => e.stopPropagation()} style={{
                            top: `${Math.min(e.pageY, window.innerHeight - dimensions.height - 8)}px`,
                            left: `${Math.min(e.pageX, window.innerWidth - dimensions.width - 8)}px`
                        }}>
                            {menu}
                        </div>;
                    }
                    return <Menu />;
                }
            });
        }
    });
};
