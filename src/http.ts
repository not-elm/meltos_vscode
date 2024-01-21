import {CreatedType, RepliedType, SpokeType} from "./types/api";
import {RoomBundleType} from "meltos_ts_lib/src/RoomBundle";

export class HttpRoomClient {
    constructor(
        private readonly opened: {
            room_id: string;
            session_id: string;
            user_id: string;
        }
    ) {
    }

    get roomId() {
        return this.opened.room_id;
    }

    get sessionId() {
        return this.opened.session_id;
    }

    static async open(userId?: string) {
        const opened = await httpOpen(userId);
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
        return await httpCreate(this.opened.room_id, this.opened.session_id, title);
    };

    readonly speak = async (discussionId: string, message: string) => {
        return await httpSpeak(
            this.opened.room_id,
            this.opened.session_id,
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
            this.opened.room_id,
            this.opened.session_id,
            discussionId,
            to,
            message
        );
    };

    readonly leave = async () => {
        await fetch(`http://localhost:3000/room/${this.roomId}`, {
            method: "DELETE",
            ...headers(this.sessionId),
        });
    };

    private readonly apiUri = (uri?: string) => {
        return !!uri
            ? `http://localhost:3000/room/${this.roomId}/${uri}`
            : `http://localhost:3000/room/${this.roomId}`;
    };
}

export const httpOpen = async (userId?: string) => {
    const response = await fetch(`http://localhost:3000/room/open`, {
        method: "POST",
        headers: {
            "content-type": "application/json",
        },
        body: JSON.stringify({
            user_id: userId,
        }),
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
        `http://localhost:3000/room/${roomId}/discussion/global/create`,
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
        `http://localhost:3000/room/${roomId}/discussion/global/speak`,
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
        `http://localhost:3000/room/${roomId}/discussion/global/reply`,
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
