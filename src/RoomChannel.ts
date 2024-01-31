import {SessionConfigsType} from "meltos_ts_lib/dist/SessionConfigs";
import WebSocket from "ws";
import {OwnerResponse, RequestMessage, RoomUserPlugin, UserRequest} from "./RoomPlugin";

export class RoomChannel {
    private constructor(
        private readonly configs: SessionConfigsType,
        private readonly ws: WebSocket
    ) {
    }

    static connect(plugins: RoomUserPlugin[], configs: SessionConfigsType): Promise<RoomChannel> {
        let completed: boolean = false;
        return new Promise((resolve, reject) => {
            const ws = new WebSocket(`ws://192.168.10.103:3000/room/${configs.room_id}/channel`, {
                headers: {
                    "set-cookie": `session_id=${configs.session_id}`,
                },
            });
            ws.onopen = () => {
                if (!completed) {
                    completed = true;
                    ws.onmessage = (message) => {

                    };
                    resolve(new RoomChannel(configs, ws));
                }
            };
            ws.onerror = (e) => {
                if (!completed) {
                    completed = true;
                    reject(e);
                }
            };
        });
    }

    request<R extends RequestMessage>(request: R): Promise<void> {
        return new Promise((resolve, reject) => {
            const message = JSON.stringify({
                from: this.configs.user_id,
                message: request
            } as UserRequest);

            this.ws.send(message, (e) => {
                if (e) {
                    reject(e);
                } else {
                    resolve();
                }
            });
        });
    }
}