import vscode from "vscode";

import { TvcChangeHistory } from "./TvcChangeHistory";
import { InitialMessage } from "meltos_ts_lib/src/scm/changes/ScmToWebMessage";
import { VscodeNodeFs } from "../fs/VscodeNodeFs";
import { MemFS } from "../fs/MemFs";
import { SessionConfigs, WasmTvcClient } from "../../wasm";

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

    readonly scmMetas = async (): Promise<InitialMessage> => {
        return {
            type: "initial",
            changes: await this._history.loadChanges(),
            stages: await this._history.loadStages(),
        };
    };

    readonly fetch = async (sessionConfigs: SessionConfigs) => {
        await this.tvc.fetch(sessionConfigs);
    };

    readonly stage = async (filePath: string) => {
        this.tvc.stage(filePath.replace("/workspace/", ""));
        await this._history.moveToStages(filePath);
        await this.fireUpdateScm();
    };

    readonly commit = async (text: string) => {
        this.tvc.commit(text);
        this._history.clearStages();
        await this.fireUpdateScm();
    };

    readonly push = async (sessionConfigs: SessionConfigs) => {
        await this.tvc.push(sessionConfigs);
    };

    private readonly fireUpdateScm = async () => {
        this._emitter.fire(await this.scmMetas());
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
