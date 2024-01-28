import {
    DiffFromWorkspaceMessage,
    HistoryFromWebMessage,
    MergeMessage,
    ShowFileMessage,
} from "meltos_ts_lib/src/scm/hitory/HistoryFromWebMessage";
import {ObjMeta} from "meltos_ts_lib/src/scm/commit/CommitMeta.ts";

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

    merge(commitHash: string) {
        this.postMessage({
            type: "merge",
            commitHash,
        } as MergeMessage);
    }

    showFile(meta: ObjMeta) {
        this.postMessage({
            type: "showFile",
            meta,
        } as ShowFileMessage);
    }

    showDiffFromWorkspace(meta: ObjMeta) {
        this.postMessage({
            type: "diffFromWorkspace",
            meta,
        } as DiffFromWorkspaceMessage);
    }

    private postMessage<T extends HistoryFromWebMessage>(message: T) {
        //@ts-ignore
        if (typeof acquireVsCodeApi === "function") {
            this._window.postMessage(message);
        } else {
            this._window.postMessage(message, "*");
        }
    }
}

export const vscodeApi = new VscodeApi();
