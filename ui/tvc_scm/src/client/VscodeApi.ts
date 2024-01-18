import {ChangeMeta} from "meltos_ts_lib/src/scm/changes.ts";
import {
    CommitMessage,
    OpenFileMessage,
    PushMessage,
    ScmFromWebMessage,
    ShowDiffMessage,
    StageMessage,
    UnStageMessage,
} from "meltos_ts_lib/src/scm/changes/ScmFromWebMessage.ts";
import {WebviewApi} from "vscode-webview";

export class VscodeApi {
    private readonly _window: Window | WebviewApi<{
        expandStages: boolean,
        expandChanges: boolean
    }>;

    constructor() {
        if (typeof acquireVsCodeApi === "function") {
            this._window = acquireVsCodeApi();
        } else {
            this._window = window;
        }
    }


    setState(state: {
        expandStages?: boolean,
        expandChanges?: boolean
    }) {
        if (!(this._window instanceof Window)) {
            const old = this.state();
            this._window.setState({
                expandStages: state.expandStages === undefined ? old.expandStages : state.expandStages,
                expandChanges: state.expandChanges === undefined ? old.expandChanges : state.expandChanges
            })
        }
    }

    state() {
        if (!(this._window instanceof Window)) {
            return this._window.getState() || {
                expandChanges: false,
                expandStages: false
            }
        } else {
            return {
                expandChanges: false,
                expandStages: false
            }
        }
    }

    openFile(filePath: string) {
        const stage: OpenFileMessage = {
            type: "openFile",
            filePath,
        };
        this.postMessage(stage);
    }

    showDiff(meta: ChangeMeta) {
        const showDiff: ShowDiffMessage = {
            type: "showDiff",
            meta
        };
        this.postMessage(showDiff);
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
        this.postMessage({type: "push"} as PushMessage);
    }

    private postMessage<T extends ScmFromWebMessage>(message: T) {
        if (typeof acquireVsCodeApi === "function") {
            this._window.postMessage(message);
        } else {
            this._window.postMessage(message, "*");
        }
    }
}

export const vscodeApi = new VscodeApi();
