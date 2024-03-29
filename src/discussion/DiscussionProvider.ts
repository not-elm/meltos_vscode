import {DiscussionTreeProvider} from "./DiscussionTreeProvider";
import {DiscussionWebViewManager} from "./DiscussionWebView";
import {ClosedType, CreatedType, RepliedType, SpokeType} from "../types/api";
import vscode from "vscode";
import {DiscussionIo} from "./io/DiscussionIo";
import {DiscussionBundleType} from "meltos_ts_lib/dist/discussion";

export class DiscussionProvider {
    constructor(
        readonly io: DiscussionIo,
        readonly tree: DiscussionTreeProvider,
        readonly viewManager: DiscussionWebViewManager
    ) {
    }

    async sync(discussions: DiscussionBundleType[]) {
        await this.withTryCatch(async () => {
            await this.io.sync(discussions);
            await this.viewManager.notifyAll();
        });
    }

    async created(created: CreatedType) {
        await this.withTryCatch(async () => {
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
            await this.viewManager.notify(replied.discussion_id);
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
