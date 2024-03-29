import {CreatedType, Open, RepliedType, SpokeType} from "./types/api";
import {RoomBundleType} from "meltos_ts_lib/src/RoomBundle";
import {SessionConfigsType} from "meltos_ts_lib/dist/SessionConfigs";

const BASE_URI: string = "https://room.meltos.net";

export class HttpRoomClient {
    constructor(
        private readonly configs: SessionConfigsType
    ) {
    }

    get roomId() {
        return this.configs.room_id;
    }

    get sessionId() {
        return this.configs.session_id;
    }

    static async open(open: Open) {
        const opened = await httpOpen(open);
        return new HttpRoomClient(opened);
    }

    readonly sync = async (): Promise<RoomBundleType> => {
        const response = await fetch(this.apiUri(), {
            ...headers(this.sessionId),
        });
        const json = await response.json();
        return json as RoomBundleType;
    };

    readonly create = async (title: string) => {
        return await httpCreate(this.configs.room_id, this.configs.session_id, title);
    };

    readonly speak = async (discussionId: string, message: string) => {
        return await httpSpeak(
            this.configs.room_id,
            this.configs.session_id,
            discussionId,
            message
        );
    };

    readonly reply = async (
        discussionId: string,
        to: string,
        message: string
    ) => {
        return await httpReply(
            this.configs.room_id,
            this.configs.session_id,
            discussionId,
            to,
            message
        );
    };

    readonly leave = async () => {
        await fetch(`${BASE_URI}/room/${this.roomId}`, {
            method: "DELETE",
            ...headers(this.sessionId),
        });
    };

    private readonly apiUri = (uri?: string) => {
        return !!uri
            ? `${BASE_URI}/room/${this.roomId}/${uri}`
            : `${BASE_URI}/room/${this.roomId}`;
    };
}

export const httpOpen = async (open: Open) => {
    const response = await fetch(`${BASE_URI}/room/open`, {
        method: "POST",
        mode: "cors",
        headers: {
            "content-type": "application/json", 
        },
        body: JSON.stringify(open),
    });
    const json = await response.json();
    return json as {
        room_id: string;
        session_id: string;
        user_id: string;
    };
};

export const httpCreate = async (
    roomId: string,
    sessionId: string,
    title: string
) => {
    const response = await fetch(
        `${BASE_URI}/room/${roomId}/discussion/global/create`,
        {
            method: "POST",
            ...headers(sessionId),
            body: JSON.stringify({
                title,
            }),
        }
    );
    const json = await response.json();
    return json as CreatedType;
};

export const httpSpeak = async (
    roomId: string,
    sessionId: string,
    discussionId: string,
    text: string
) => {
    const response = await fetch(
        `${BASE_URI}/room/${roomId}/discussion/global/speak`,
        {
            method: "POST",
            ...headers(sessionId),
            body: JSON.stringify({
                discussion_id: discussionId,
                text,
            }),
        }
    );
    const json = await response.json();
    return json as SpokeType;
};

export const httpReply = async (
    roomId: string,
    sessionId: string,
    discussionId: string,
    to: string,
    message: string
) => {
    const response = await fetch(
        `${BASE_URI}/room/${roomId}/discussion/global/reply`,
        {
            method: "POST",
            ...headers(sessionId),
            body: JSON.stringify({
                discussion_id: discussionId,
                to,
                text: message,
            }),
        }
    );
    const json = await response.json();
    return json as RepliedType;
};

const headers = (sessionId: string) => {
    return {
        headers: {
            "content-type": "application/json",
            "set-cookie": `session_id=${sessionId}`,
        },
    };
};
