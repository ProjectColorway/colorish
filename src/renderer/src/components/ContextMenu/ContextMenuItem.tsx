import { Dispatcher } from "@renderer/api";

export default function ContextMenuItem({ onClick, children, dangerous }: { onClick: React.MouseEventHandler<HTMLButtonElement>, children: React.ReactNode, dangerous?: boolean; }) {
    return <button
        className={`dc-contextmenu-item${dangerous ? " dc-contextmenu-item-danger" : ""}`}
        onClick={(e) => {
            Dispatcher.emit("CLOSE_CONTEXT_MENU", null);
            onClick(e);
        }}
    >
        {children}
    </button>;
}
