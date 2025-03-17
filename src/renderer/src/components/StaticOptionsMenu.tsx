import { useEffect, useState } from "react";

export default function ({
    children,
    menu,
    xPos = "left",
    yPos = "bottom"
}: {
    children: (props: { onClick: React.MouseEventHandler<HTMLElement>; }) => JSX.Element,
    menu: JSX.Element,
    xPos?: "left" | "right",
    yPos?: "top" | "bottom";
}) {
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const [showMenu, setShowMenu] = useState(false);

    function rightClickContextMenu(e: React.MouseEvent<HTMLElement, MouseEvent>) {
        e.stopPropagation();
        window.dispatchEvent(new Event("click"));
        setShowMenu(!showMenu);
        setPos({
            x: (() => {
                switch (xPos) {
                    case "left":
                        return e.currentTarget.getBoundingClientRect().x;
                    case "right":
                        return window.innerWidth - e.currentTarget.getBoundingClientRect().x - e.currentTarget.offsetWidth;
                }
            })(),
            y: (() => {
                switch (yPos) {
                    case "bottom":
                        return e.currentTarget.getBoundingClientRect().y + e.currentTarget.offsetHeight + 8;
                    case "top":
                        return window.innerHeight - e.currentTarget.getBoundingClientRect().y - e.currentTarget.offsetHeight - 8;
                }
            })()
        });

        return;
    }

    function onPageClick(this: Window) {
        setShowMenu(false);
    }

    function Menu() {
        useEffect(() => {
            window.addEventListener("click", onPageClick);
            return () => {
                window.removeEventListener("click", onPageClick);
            };
        }, []);
        return <nav className={`dc-contextmenu overflow-auto no-scrollbar`} style={{
            position: "fixed",
            top: `${pos.y}px`,
            maxHeight: `calc(100vh - 4px - ${pos.y}px)`,
            ...(xPos === "left" ? { left: `${pos.x}px` } : { right: `${pos.x}px` })
        }}>
            {menu}
        </nav>;
    }

    return <>
        {showMenu ? <Menu /> : null}
        {children({
            onClick: (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
                rightClickContextMenu(e);
            }
        })}
    </>;
}
