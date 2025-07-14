import * as Dispatcher from "@api/Dispatcher";

export function showNotification(msg: string, actions?: React.ReactNode) {
    Dispatcher.emit("OPEN_NOTIFICATION", { msg, actions });
}

export function closeNotification(id?: string) {
    Dispatcher.emit("CLOSE_NOTIFICATION", { id });
}
