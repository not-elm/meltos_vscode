import {FileChangeEventEmitter} from "./FileChangeEventEmitter";
import vscode from "vscode";

export class FileChangeObserver {
    private readonly _remitters: FileChangeEventEmitter[] = [];
    private _emitter = new vscode.EventEmitter<vscode.FileChangeEvent[]>();
    onDidChangeFile: vscode.Event<vscode.FileChangeEvent[]> = this._emitter.event;

    register(emitter: FileChangeEventEmitter) {
        this._remitters.push(emitter);
        emitter.Event(events => {
            this._emitter.fire(events);
        });
    }


}