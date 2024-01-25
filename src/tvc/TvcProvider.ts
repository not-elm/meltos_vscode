import vscode from "vscode";

import { TvcChangeHistory } from "./TvcChangeHistory";
import { SourceControlMetaMessage } from "meltos_ts_lib/src/scm/changes/ScmToWebMessage";
import { SessionConfigs, WasmTvcClient } from "../../wasm";
import { BundleType } from "meltos_ts_lib/src/tvc/Bundle";
import { TvcHistoryWebView } from "./TvcHistoryWebView";
import { RootFileSystem } from "../fs/RootFileSystem";

export class TvcProvider {
    private readonly _history: TvcChangeHistory;
    private _emitter = new vscode.EventEmitter<SourceControlMetaMessage>();
    readonly onUpdateScm: vscode.Event<SourceControlMetaMessage> =
        this._emitter.event;

    constructor(
        private readonly tvc: WasmTvcClient,
        private readonly view: TvcHistoryWebView,
        private readonly fileSystem: RootFileSystem
    ) {
        this._history = new TvcChangeHistory(fileSystem.fs, tvc);
        this.registerChangeFileEvents();
    }

    readonly saveBundle = async (bundle: BundleType) => {
        await this.tvc.sync_bundle(
            JSON.stringify({
                traces: bundle.traces,
                objs: bundle.objs,
                branches: bundle.branches,
            } as BundleType)
        );
        await this.view.postMessage();
    };

    readonly scmMetas = async (): Promise<SourceControlMetaMessage> => {
        console.log(this._history.loadChanges());
        return {
            type: "initial",
            canPush: await this.tvc.can_push(),
            changes: await this._history.loadChanges(),
            stages: await this._history.loadStages(),
        };
    };

    readonly fetch = async (sessionConfigs: SessionConfigs) => {
        await this.tvc.fetch(sessionConfigs);
    };

    readonly stage = async (filePath: string | null) => {
        if (filePath) {
            await this.tvc.stage(filePath.replace("/workspace/", ""));
            await this._history.moveToStagesFromChanges(filePath);
        } else {
            await this.tvc.stage(".");
            await this._history.allMoveToStagesFromChanges();
        }
        await this.fireUpdateScm();
    };

    readonly unStage = async (filePath: string | null) => {
        if (filePath) {
            await this.tvc.un_stage(filePath);
            await this._history.moveToChangesFromStages(filePath);
        } else {
            await this.tvc.un_stage_all();
            await this._history.allMoveToChangesFromStages();
        }
        await this.fireUpdateScm();
    };

    readonly commit = async (text: string) => {
        await this.tvc.commit(text);
        await this._history.clearStages();
        await this.fireUpdateScm();
        vscode.window.showInformationMessage("committed success");
    };

    readonly push = async (sessionConfigs: SessionConfigs) => {
        await this.tvc.push(sessionConfigs);
        vscode.window.showInformationMessage("pushed success");
    };

    private readonly fireUpdateScm = async () => {
        this._emitter.fire(await this.scmMetas());
    };

    private registerChangeFileEvents() {
        this.fileSystem.onDidChangeFile(async (changes) => {
            for (const event of changes.filter((c) =>
                c.uri.path.startsWith("/workspace/")
            )) {
                await this._history.feed(event);
                await this.fireUpdateScm();
            }
        });
    }
}
