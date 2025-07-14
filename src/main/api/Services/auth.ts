import cors from "cors";
import { shell } from "electron";
import Express, { Request } from "express";
import { Server } from "http";

import { setAuthResult } from "../../";

class AuthClient {
    private _server!: Server;
    private expressApp = Express();

    public authenticate() {
        shell.openExternal("https://dablulite.dev/colorways/manager/authenticate?callback=" + encodeURI("http://localhost:5005/auth"));

        this.expressApp.use(cors({ origin: "*", credentials: true }));
        this.expressApp.use(Express.json());

        this._server = this.expressApp.listen(5005);

        this.expressApp.post("/auth", async (req: Request) => {
            if (req.body.status === 200) {
                setAuthResult({ username: req.body.username, image: req.body.image });
            }
        });
    }

    public stopListening = () => {
        this._server.close();
    };
}

export default AuthClient;
