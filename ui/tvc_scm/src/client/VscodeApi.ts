import { ChangeMeta } from "meltos_ts_lib/src/scm/changes.ts";
import {
    CommitMessage,
    PushMessage,
    ScmFromWebMessage,
    StageMessage,
    UnStageMessage,
} from "meltos_ts_lib/src/scm/changes/ScmFromWebMessage.ts";

export class VscodeApi {
    private readonly _window: any;

    constructor() {
        //@ts-ignore
        if (typeof acquireVsCodeApi === "function") {
            //@ts-ignore
            this._window = acquireVsCodeApi();
        } else {
            this._window = window;
        }
    }

    stage(meta: ChangeMeta) {
        const stage: StageMessage = {
            type: "stage",
            meta,
        };
        this.postMessage(stage);
    }

    unStage(meta: ChangeMeta) {
        const stage: UnStageMessage = {
            type: "unStage",
            meta,
        };
        this.postMessage(stage);
    }

    commit(commitText: string) {
        this.postMessage({
            type: "commit",
            commitText,
        } as CommitMessage);
    }

    push() {
        this.postMessage({ type: "push" } as PushMessage);
    }

    private postMessage<T extends ScmFromWebMessage>(message: T) {
        //@ts-ignore
        if (typeof acquireVsCodeApi === "function") {
            this._window.postMessage(message);
        } else {
            this._window.postMessage(message, "*");
        }
    }
}

export const vscodeApi = new VscodeApi();
