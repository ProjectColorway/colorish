export const dispatch = {
    addListener(event: string, callback: (payload: any) => void) {
        window.addEventListener("message", (e) => {
            if (e.source === window && e.data.type === "client_" + event) {
                callback(e.data);
            }
        });
    },
    emit(event: string, payload: any) {
        window.dispatchEvent(new MessageEvent("message", { data: { type: "client_" + event, ...payload } }));
    },
    removeListener(event: string, callback: (payload: any) => void) {
        window.removeEventListener("message", (e) => {
            if (e.source === window && e.data.type === "client_" + event) {
                callback(e.data);
            }
        });
    }
};
