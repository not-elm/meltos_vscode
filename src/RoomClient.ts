import {SessionConfigsType} from "./SessionConfigs";
import {HttpRoomClient} from "./http";
import {RoomChannel} from "./RoomChannel";
import {RequestMessage} from "./RoomPlugin";

export class RoomClient {
    constructor(
        private readonly channel: RoomChannel,
        private readonly http: HttpRoomClient
    ) {
    }

    static async connect() {
        const http = await HttpRoomClient.open();
        const channel = await http.connectChannel();
        return new RoomClient(channel, http);
    }

    async request<R extends RequestMessage>(request: R) {
        await this.channel.request(request);
    }
}