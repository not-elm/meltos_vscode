import vscode from "vscode";

import { TvcChangeHistory } from "./TvcChangeHistory";
import { InitialMessage } from "meltos_ts_lib/src/scm/changes/ScmToWebMessage";
import { VscodeNodeFs } from "../fs/VscodeNodeFs";
import { MemFS } from "../fs/MemFs";
import { SessionConfigs, WasmTvcClient } from "../../wasm";
import { BundleType } from "meltos_ts_lib/src/tvc/Bundle";
import { convertToWasmBundle } from "../extension";
import { TvcHistoryWebView } from "./TvcHistoryWebView";

export class TvcProvider {
    private readonly _history: TvcChangeHistory;
    private _emitter = new vscode.EventEmitter<InitialMessage>();
    readonly onUpdateScm: vscode.Event<InitialMessage> = this._emitter.event;

    constructor(
        private readonly tvc: WasmTvcClient,
        private readonly view: TvcHistoryWebView,
        private readonly meltos: any,
        private readonly fileSystem: VscodeNodeFs | MemFS
    ) {
        this._history = new TvcChangeHistory(fileSystem, tvc);
        this.registerChangeFileEvents();
    }

    readonly saveBundle = async (bundle: BundleType) => {
        this.tvc.save_bundle(convertToWasmBundle(bundle, this.meltos));
        this.view.postMessage();
    };

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

    readonly stage = (filePath: string | null) => {
        if (filePath) {
            this.tvc.stage(filePath.replace("workspace/", ""));
            this._history.moveToStagesFromChanges(filePath);
        } else {
            this.tvc.stage(".");
            this._history.allMoveToStagesFromChanges();
        }
        this.fireUpdateScm();
    };

    readonly unStage = (filePath: string | null) => {
        if (filePath) {
            this.tvc.un_stage(filePath);
            this._history.moveToChangesFromStages(filePath);
        } else {
            this.tvc.un_stage_all();
            this._history.allMoveToChangesFromStages();
        }
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
                await this._history.feed(event);
                this.fireUpdateScm();
            }
        });
    }
}
