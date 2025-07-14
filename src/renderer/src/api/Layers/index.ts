import * as Dispatcher from "@api/Dispatcher";

export function openLayer(render: (props: { onClose(): void, id: string; }) => React.ReactNode) {
    Dispatcher.emit("OPEN_LAYER", {
        render
    });
}

export function closeLayer(id?: string) {
    Dispatcher.emit("CLOSE_LAYER", { id });
}
