import { Dispatcher } from "flux";
const events = {};

const dp = new Dispatcher();

export function addListener(event: string, callback: (payload: any) => void) {
    const id = dp.register((payload: any) => {
        if (payload.event === event) callback(payload);
    });
    if (!events[event]) events[event] = {};
    events[event][id] = callback;
}

export function emit(event: string, payload: any) {
    dp.dispatch({
        event,
        ...payload
    });
}

export function removeListener(event: string, callback: (payload: any) => void) {
    if (events[event]) {
        const id = Object.values(events[event]).indexOf(callback);
        if (id > -1) {
            delete events[event][id];
            dp.unregister(Object.keys(events[event])[id]);
        }
    }
}
