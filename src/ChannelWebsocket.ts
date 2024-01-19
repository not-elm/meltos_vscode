import WebSocket from "ws";
import * as vscode from "vscode";
import {DiscussionProvider} from "./discussion/io/DiscussionIo";
import {ClosedType, CreatedType, RepliedType, SpokeType} from "./types/api";
import {SessionConfigs} from "../wasm";

export class ChannelWebsocket implements vscode.Disposable {
    private _ws: WebSocket | undefined;

    constructor(
        private readonly discussion: DiscussionProvider,
        private readonly sessionConfigs: SessionConfigs
    ) {
    }

    connectChannel(roomId: string, sessionId: string) {
        const ws = new WebSocket(`ws://localhost:3000/room/${roomId}/channel`, {
            headers: {
                "set-cookie": `session_id=${sessionId}`,
            },
        });

        ws.on("open", async () => {
            await vscode.window.showInformationMessage(`open room`);
        });

        ws.on("error", async (message) => {
            await vscode.window.showErrorMessage(message.message);
        });

        ws.on("message", this.onMessage);
        this._ws = ws;
    }

    dispose() {
        this._ws?.close();
    }

    onMessage = async (message: WebSocket.RawData) => {
        console.log(`message = ${message.toString()}`);
        const json: RoomMessage = JSON.parse(message.toString());
        const ty = json.message["type"];
        switch (ty) {
            case "joined":
                const joined = json.message as Joined;
                // this.users.pushUser(joined.user_id);
                vscode.window.showInformationMessage(
                    `Joined user id=${joined.user_id}`
                );
                break;
            case "discussionCreated":
                await this.onCreated(json.message as CreatedType);
                break;
            case "discussionReplied":
                await this.onReplied(json.from, json.message as RepliedType);
                break;
            case "discussionSpoke":
                await this.onSpoke(json.from, json.message as SpokeType);
                break;
            case "discussionClosed":
                await this.onClosed(json.message as ClosedType);
                break;
        }
    };

    onCreated = async (created: CreatedType) => {
        await this.withTryCatch(async () => {
            vscode.window.showInformationMessage(`created discussion\n
                 creator=${created.meta.creator}\n
                 id=${created.meta.id}
            `);
            await this.discussion.created(created);
        });
    };

    onSpoke = async (from: string, spoke: SpokeType) => {
        await this.withTryCatch(async () => {
            this.showComingMessageIfFromOthers(from, spoke.discussion_id);
            await this.discussion.spoke(spoke);
        });
    };

    onReplied = async (from: string, replied: RepliedType) => {
        await this.withTryCatch(async () => {
            // this.showComingMessageIfFromOthers(from, replied.);
            await this.discussion.replied(replied);
        });
    };

    async onClosed(closed: ClosedType) {
        vscode.window.showInformationMessage(
            `closed discussion id=${closed.discussion_id}`
        );
        await this.withTryCatch(async () => {
            await this.discussion.closed(closed);
        });
    }


    private readonly showComingMessageIfFromOthers = (
        from: string,
        discussionId: string
    ) => {
        if (this.fromOthers(from)) {
            vscode
                .window
                .showInformationMessage(`coming message from ${from}`, discussionId)
                .then(async discussionId => {
                    if (discussionId) {
                        await vscode.commands.executeCommand("meltos.discussion.show", discussionId);
                    }
                });
        }
    };

    private readonly fromOthers = (userId: string) => {
        return this.sessionConfigs.user_id[0] !== userId;
    };

    private readonly ownedMessage = (userId: string) => {
        return this.sessionConfigs.user_id[0] === userId;
    };

    private async withTryCatch<T>(f: () => Promise<T>) {
        try {
            return await f();
        } catch (e) {
            if (e instanceof Error) {
                vscode.window.showErrorMessage(e.message);
            }
        }
    }
}

export interface RoomMessage {
    from: string;
    message: any;
}

export interface Joined {
    user_id: string;
}
