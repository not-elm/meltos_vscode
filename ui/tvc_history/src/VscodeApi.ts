import {HistoryFromWebMessage, ShowFileMessage} from "meltos_ts_lib/dist/scm/hitory/HistoryFromWebMessage";

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

    showFile(objHash: string) {
        this.postMessage({
            type: "showFile",
            objHash
        } as ShowFileMessage)
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
