import WebSocket from "ws";
import * as vscode from "vscode";

import { ClosedType, CreatedType, JoinedType, LeftType, RepliedType, SpokeType } from "./types/api";
import { SessionConfigs } from "../wasm";
import { DiscussionProvider } from "./discussion/DiscussionProvider";
import { TvcProvider } from "./tvc/TvcProvider";
import { BundleType } from "meltos_ts_lib/src/tvc/Bundle";
import { HttpRoomClient } from "./http";
import { RoomUsersTreeProvider } from "./RoomUsersTreeProvider";
import { RoomFileSystem } from "./fs/RoomFileSystem";
import { wasm } from "./wasm";

export class ChannelWebsocket implements vscode.Disposable {
    private _ws: WebSocket | undefined;

    constructor(
        private readonly discussion: DiscussionProvider,
        private readonly users: RoomUsersTreeProvider,
        private readonly roomFs: RoomFileSystem,
        private readonly tvc: TvcProvider,
        private readonly sessionConfigs: SessionConfigs
    ) { }

    connectChannel(roomId: string, sessionId: string) {
        const statusBar = vscode.window.createStatusBarItem();

        const ws = new WebSocket(`ws://192.168.10.103:3000/room/${roomId}/channel`, {
            headers: {
                "set-cookie": `session_id=${sessionId}`,
            },
        });

        ws.on("open", async () => {
            console.log("room channel opened");
            statusBar.text = "$(broadcast) room";
            statusBar.tooltip = "room connecting";
            statusBar.show();
        });

        ws.on("error", async (message) => {
            await vscode.window.showErrorMessage(message.message);
        });

        ws.on("message", this.onMessage);

        ws.on("close", async () => {
            console.log("close room channel");
            await vscode.window.showWarningMessage("Room closed");

            const http = new HttpRoomClient({
                room_id: this.sessionConfigs.room_id[0],
                session_id: this.sessionConfigs.session_id[0],
                user_id: this.sessionConfigs.user_id[0],
            });
            await http.leave();
            statusBar.hide();
            const folders = vscode.workspace.workspaceFolders?.length;
            vscode.workspace.updateWorkspaceFolders(0, folders);
        });

        this._ws = ws;
    }

    dispose() {
        this._ws?.close();
    }

    onMessage = async (message: WebSocket.RawData) => {
        const json: RoomMessage = JSON.parse(message.toString());
        const ty = json.message["type"];
        switch (ty) {
            case "joined":
                await this.onJoined(json.message as JoinedType);
                break;
            case "left":
                await this.onLeft(json.message as LeftType);
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
            case "pushed":
                await this.onPushed(json.from, json.message);
                break;
            case "closedRoom":
                await this.onClosedRoom();
                break;
        }
    };

    private onJoined = async (joined: JoinedType) => {
        this.users.pushUser(joined.user_id);
        vscode.window.showInformationMessage(
            `Joined ${joined.user_id}`
        );
        const meltos = await wasm;
        const fs = new meltos.WasmFileSystem();
        const tvc = new meltos.WasmTvcClient(fs);
        this.roomFs.set(joined.user_id, tvc);

        const folders = vscode.workspace.workspaceFolders?.length;
        vscode.workspace.updateWorkspaceFolders(folders || 0, null, {
            uri: vscode.Uri.parse("users:/").with({
                authority: joined.user_id
            }),
            name: joined.user_id
        });
        await tvc.unzip(joined.user_id);
    };

    private onLeft = async (left: LeftType) => {
        const leftUser = left.user_id;
        this.users.deleteUser(leftUser);
        const index = vscode.workspace.workspaceFolders?.findIndex(w => w.name === leftUser);
        if (index && 0 <= index) {
            this.roomFs.remove(leftUser);
            vscode.workspace.updateWorkspaceFolders(index, 1);
            vscode.window.showInformationMessage(`left ${leftUser}`);
        }
    };


    private onClosedRoom = async () => {
        vscode.window.showInformationMessage("Room closed by owner");
        this._ws?.close();
    };

    private onCreated = async (created: CreatedType) => {
        await this.withTryCatch(async () => {
            this.showComingMessageIfFromOthers(
                created.meta.creator,
                `Created discussion(${created.meta.title})` ,
                created.meta.id
            );

            await this.discussion.created(created);
        });
    };

    private onSpoke = async (from: string, spoke: SpokeType) => {
        await this.withTryCatch(async () => {
            this.showComingMessageIfFromOthers(
                from,
                spoke.message.text,
                spoke.discussion_id
            );
            await this.discussion.spoke(spoke);
        });
    };

    private onReplied = async (from: string, replied: RepliedType) => {
        await this.withTryCatch(async () => {
            this.showComingMessageIfFromOthers(
                from,
                replied.message.text,
                replied.discussion_id
            );
            await this.discussion.replied(replied);
        });
    };

    async onClosed(closed: ClosedType) {
        vscode.window.showInformationMessage(
            `Closed discussion(${closed.discussion_id})`
        );
        await this.withTryCatch(async () => {
            await this.discussion.closed(closed);
        });
    }

    private readonly onPushed = async (from: string, bundle: BundleType) => {
        try {
            await this.tvc.saveBundle(bundle);
            if (this.fromOthers(from)) {
                vscode.window.showInformationMessage(`Pushed from ${from}`);
                const userTvc = this.roomFs.get(from);
                if (userTvc) {
                    await userTvc.unzip(from);
                }
            }
        } catch (e) {
            vscode.window.showErrorMessage(`onPushed:${e}`);
        }
    };

    private readonly showComingMessageIfFromOthers = (
        from: string,
        message: string,
        discussionId: string
    ) => {
        if (this.fromOthers(from)) {
            vscode.window
                .showInformationMessage(message, "Open discussion")
                .then(async (item) => {
                    if (item) {
                        await vscode.commands.executeCommand(
                            "meltos.discussion.show",
                            discussionId
                        );
                    }
                });
        }
    };

    private readonly fromOthers = (userId: string) => {
        return this.sessionConfigs.user_id[0] !== userId;
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
