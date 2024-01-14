import WebSocket from "ws";
import * as vscode from "vscode";
import {DiscussionProvider} from "./discussion/io/DiscussionIo";
import {ClosedType, CreatedType, RepliedType, SpokeType} from "./types/api";

export class ChannelWebsocket {
    constructor(private readonly discussion: DiscussionProvider) {
    }

    public async connectChannel(roomId: string, sessionId: string) {
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
    }

    onMessage = async (message: WebSocket.RawData) => {
        console.log(`message = ${message.toString()}`);
        const json: RoomMessage = JSON.parse(message.toString());
        const ty = json.message["type"];
        switch (ty) {
            case "joined":
                const joined = json.message as Joined;
                // this.users.pushUser(joined.user_id);
                await vscode.window.showInformationMessage(
                    `Joined user id=${joined.user_id}`
                );
                break;
            case "discussionCreated":
                await this.onCreated(json.message as CreatedType);
                break;
            case "discussionReplied":
                await this.onReplied(json.message as RepliedType);
                break;
            case "discussionSpoke":
                await this.onSpoke(json.message as SpokeType);
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

    onSpoke = async (spoke: SpokeType) => {
        await this.withTryCatch(async () => {
            vscode.window.showInformationMessage(
                `spoke message=${spoke.text.text}`
            );
            await this.discussion.spoke(spoke);
        });
    };

    onReplied = async (replied: RepliedType) => {
        await this.withTryCatch(async () => {
            vscode.window.showInformationMessage(
                `coming reply message id=${replied.to}`
            );
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

    private async withTryCatch<T>(f: () => Promise<T>) {
        try {
            return await f();
        } catch (e) {
            if (e instanceof Error) {
                await vscode.window.showErrorMessage(e.message);
            }
            await this.discussion[Symbol.asyncDispose]();
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
