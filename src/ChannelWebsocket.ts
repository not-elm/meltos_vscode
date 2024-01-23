import WebSocket from "ws";
import * as vscode from "vscode";

import { ClosedType, CreatedType, RepliedType, SpokeType } from "./types/api";
import { SessionConfigs } from "../wasm";
import { DiscussionProvider } from "./discussion/DiscussionProvider";
import { TvcProvider } from "./tvc/TvcProvider";
import { BundleType } from "meltos_ts_lib/src/tvc/Bundle";
import {HttpRoomClient} from "./http";

export class ChannelWebsocket implements vscode.Disposable {
	private _ws: WebSocket | undefined;

	constructor(
		private readonly discussion: DiscussionProvider,
		private readonly tvc: TvcProvider,
		private readonly sessionConfigs: SessionConfigs
	) {}

	connectChannel(roomId: string, sessionId: string) {
		const statusBar = vscode.window.createStatusBarItem();

		const ws = new WebSocket(`ws://localhost:3000/room/${roomId}/channel`, {
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
			const http = new HttpRoomClient({
				room_id: this.sessionConfigs.room_id[0],
				session_id: this.sessionConfigs.session_id[0],
				user_id: this.sessionConfigs.user_id[0]
			});
			await http.leave();
			statusBar.hide();
		});

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
			case "pushed":
				await this.onPushed(json.from, json.message);
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
			this.showComingMessageIfFromOthers(
				from,
				spoke.message.text,
				spoke.discussion_id
			);
			await this.discussion.spoke(spoke);
		});
	};

	onReplied = async (from: string, replied: RepliedType) => {
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
			`closed discussion id=${closed.discussion_id}`
		);
		await this.withTryCatch(async () => {
			await this.discussion.closed(closed);
		});
	}

	private readonly onPushed = async (from: string, bundle: BundleType) => {
		if (this.fromOthers(from)) {
			vscode.window.showInformationMessage(`pushed from ${from}`);
		}
		await this.tvc.saveBundle(bundle);
	};

	private readonly showComingMessageIfFromOthers = (
		from: string,
		message: string,
		discussionId: string
	) => {
		if (this.fromOthers(from)) {
			vscode.window
				.showInformationMessage(message, "open discussion")
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
