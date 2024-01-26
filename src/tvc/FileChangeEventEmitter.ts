import { SourceControlMetaMessage } from "meltos_ts_lib/src/scm/changes/ScmToWebMessage";
import * as vscode from "vscode";

export class FileChangeEventEmitter {
    private _emitter = new vscode.EventEmitter<vscode.FileChangeEvent[]>();
    readonly Event = this._emitter.event;

    notify(uri: string, changeType: "create" | "change" | "delete") {
        this._emitter.fire([
            {
                type: convertToFileChangeType(changeType),
                uri: vscode.Uri.parse(uri).with({
                    scheme: "meltos",
                }),
            },
        ]);
    }
}

const convertToFileChangeType = (
    changeType: "create" | "change" | "delete"
) => {
    switch (changeType) {
        case "create":
            return vscode.FileChangeType.Created;
        case "change":
            return vscode.FileChangeType.Changed;
        case "delete":
            return vscode.FileChangeType.Deleted;
    }
};
