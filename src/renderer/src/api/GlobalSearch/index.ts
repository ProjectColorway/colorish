import { Dispatcher } from "..";

export function setSearchOpen(value: boolean) {
    Dispatcher.emit("SET_GS_OPEN", { open: value });
}
