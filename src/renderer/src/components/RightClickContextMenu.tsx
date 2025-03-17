import { useContextMenu } from "@renderer/api/Hooks";

function ContextMenu({
    children,
    menu
}: {
    children: (props: { onContextMenu: React.MouseEventHandler<HTMLElement>; }) => JSX.Element,
    menu: React.ReactNode;
}) {
    const { clicked, setClicked, points, setPoints } = useContextMenu();
    return (
        <>
            {children({
                onContextMenu(e) {
                    setClicked(true);
                    setPoints({
                        x: e.pageX,
                        y: e.pageY,
                    });
                }
            })}
            {clicked && (
                <div className={`dc-contextmenu overflow-auto no-scrollbar !fixed`} style={{
                    top: `${points.y}px`,
                    left: `${points.x}px`
                }}>
                    {menu}
                </div>
            )}
        </>
    );
};

export default ContextMenu;
