export function getClientDisplayName(clientKey: string) {
    if (clientKey.startsWith("vencord"))
        return `Vencord Client (${clientKey.split("vencord.")[1]})`;
    if (clientKey.startsWith("betterdiscord"))
        return `BetterDiscord Client (${clientKey.split("betterdiscord.")[1]
            })`;
    if (clientKey.startsWith("discord"))
        return `Discord Client (${clientKey.split("discord.")[1]})`;
    if (clientKey.startsWith("vendetta"))
        return `Vendetta/Bunny Client (${clientKey.split("vendetta.")[1]})`;
    if (clientKey.startsWith("github"))
        return `GitHub Client (${clientKey.split("github.")[1]})`;
    if (clientKey.startsWith("gh"))
        return `GitHub Client (${clientKey.split("gh.")[1]})`;
    if (clientKey.startsWith("te"))
        return `ThemeEngine Instance (${clientKey.split("te.")[1]})`;
    return clientKey;
}

export function sendColorway(colorway: ColorwayObject) {
    if ((window as any).dc_win) dc_win.getWsClients().forEach(ws => ws.changeColorway(colorway));
    else fetch("/send-colorway", {
        method: "POST",
        body: JSON.stringify(colorway)
    });
}

export function removeColorway() {
    if ((window as any).dc_win) dc_win.getWsClients().forEach(ws => ws.removeColorway());
    else fetch("/remove-colorway", {
        method: "POST"
    });
}
