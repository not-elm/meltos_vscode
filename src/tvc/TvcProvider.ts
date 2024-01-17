import vscode from "vscode";

import {TvcChangeHistory} from "./TvcChangeHistory";
import {InitialMessage} from "meltos_ts_lib/src/scm/changes/ScmToWebMessage";
import {VscodeNodeFs} from "../fs/VscodeNodeFs";
import {MemFS} from "../fs/MemFs";
import {SessionConfigs, WasmTvcClient} from "../../wasm";

export class TvcProvider {
    private readonly _history: TvcChangeHistory;
    private _emitter = new vscode.EventEmitter<InitialMessage>();
    readonly onUpdateScm: vscode.Event<InitialMessage> = this._emitter.event;

    constructor(
        private readonly tvc: WasmTvcClient,
        private readonly fileSystem: VscodeNodeFs | MemFS
    ) {
        this._history = new TvcChangeHistory(fileSystem, tvc);
        this.registerChangeFileEvents();
    }

    readonly scmMetas = (): InitialMessage => {
        return {
            type: "initial",
            changes: this._history.loadChanges(),
            stages: this._history.loadStages(),
        };
    };

    readonly fetch = async (sessionConfigs: SessionConfigs) => {
        await this.tvc.fetch(sessionConfigs);
    };

    readonly stage = (filePath: string) => {
        this.tvc.stage(filePath.replace("/workspace/", ""));
        this._history.moveToStages(filePath);
        this.fireUpdateScm();
    };

    readonly commit = (text: string) => {
        this.tvc.commit(text);
        this._history.clearStages();
        this.fireUpdateScm();
        vscode.window.showInformationMessage("committed success");
    };

    readonly push = async (sessionConfigs: SessionConfigs) => {
        await this.tvc.push(sessionConfigs);
        vscode.window.showInformationMessage("pushed success");
    };

    private readonly fireUpdateScm = () => {
        this._emitter.fire(this.scmMetas());
    };

    private registerChangeFileEvents() {
        this.fileSystem.onDidChangeFile(async (changes) => {
            for (const event of changes.filter((c) =>
                c.uri.path.startsWith("/workspace/")
            )) {
                await this._history.inspectChangeStatus(event);
                await this.fireUpdateScm();
            }
        });
    }
}
