import {DiscussionTreeProvider} from "../DiscussionTreeProvider";
import vscode from "vscode";
import {DiscussionWebViewManager} from "../DiscussionWebView";

import {ClosedType, CreatedType, DiscussionMetaType, RepliedType, SpokeType,} from "../../types/api";

export interface DiscussionData {
    meta: DiscussionMetaType;
    messages: MessageThread[];
}

export interface MessageThread {
    message: MessageData;
    replies?: MessageData[];
}

export interface MessageData {
    id: string;
    user_id: string;
    text: string;
}

export interface DiscussionIo {
    created(created: CreatedType): Promise<void>;

    spoke(spoke: SpokeType): Promise<void>;

    replied(replied: RepliedType): Promise<void>;

    closed(closed: ClosedType): Promise<void>;

    dispose(): Promise<void>;

    discussionIds(): DiscussionMetaType[];

    discussion(id: string): DiscussionData | undefined;
}

export class DiscussionProvider  {
    constructor(
        readonly io: DiscussionIo,
        readonly tree: DiscussionTreeProvider,
        readonly viewManager: DiscussionWebViewManager
    ) {
    }

    async created(created: CreatedType) {
        await this.withTryCatch(async () => {
            vscode.window.showInformationMessage(`created discussion\n
                creator=${created.meta.creator}\n
                id=${created.meta.id}
            `);
            await this.io.created(created);
        });
    }

    async spoke(spoke: SpokeType) {
        await this.withTryCatch(async () => {
            await this.io.spoke(spoke);
            await this.viewManager.notify(spoke.discussion_id);
        });
    }

    async replied(replied: RepliedType) {
        await this.withTryCatch(async () => {
            await this.io.replied(replied);
            await this.viewManager.notifyAll();
        });
    }

    async closed(closed: ClosedType) {
        await vscode.window.showInformationMessage(
            `closed discussion id=${closed.discussion_id}`
        );
        await this.withTryCatch(async () => {
            await this.io.closed(closed);
            await this.viewManager.notify(closed.discussion_id[0]);
        });
    }



    private async withTryCatch<T>(f: () => Promise<T>) {
        try {
            const out = await f();
            this.tree.notify();
            return out;
        } catch (e) {
            if (e instanceof Error) {
                await vscode.window.showErrorMessage(e.message);
            }
            await this.io.dispose();
        }
    }
}
