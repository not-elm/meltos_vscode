import vscode, {ThemeIcon} from "vscode";
import {SessionConfigs, TvnClient} from "meltos_client";

import path from "path";
import {toMeltosUri} from "../fs/util";

export class TvnSourceControl implements vscode.Disposable {
    private readonly _sc: vscode.SourceControl;
    private readonly _stages: vscode.SourceControlResourceGroup;
    private readonly _changes: vscode.SourceControlResourceGroup;

    constructor(
        private readonly sessionConfigs: SessionConfigs,
        private readonly context: vscode.ExtensionContext,
        private readonly tvn: TvnClient
    ) {
        this._sc = vscode.scm.createSourceControl(
            "meltos",
            "meltos",
            vscode.Uri.parse("meltos:/")
        );

        this._stages = this._sc.createResourceGroup("staging", "staging");
        this._changes = this._sc.createResourceGroup("changes", "changes");

        const watcher = vscode.workspace.createFileSystemWatcher(
            new vscode.RelativePattern(vscode.Uri.parse("meltos:/workspace"), "*.*")
        );
        watcher.onDidCreate(this.onResourceChange);
        watcher.onDidChange(this.onResourceChange);

        this.registerFetchCommand();
        this.registerStageCommand();
        this.registerCommitCommand();
        this.registerPushCommand();
        this.registerMergeCommand();
        context.subscriptions.push(this._sc);
    }

    dispose() {
        this._sc.dispose();
    }

    private readonly registerFetchCommand = () => {
        const command = vscode.commands.registerCommand(
            "meltos.fetch",
            async () => {
                await this.fetch();
            }
        );
        this.context.subscriptions.push(command);
    };


    private readonly registerStageCommand = () => {
        const command = vscode.commands.registerCommand(
            "meltos.stage",
            async (filePath?: string) => {
                const stageFilePath = filePath || (await vscode.window.showInputBox());
                if (stageFilePath) {
                    this.stage(stageFilePath);
                    this._changes.resourceStates = this._changes.resourceStates.filter(
                        (s) => path.basename(s.resourceUri.fsPath) !== stageFilePath
                    );
                    this._stages.resourceStates = [
                        ...this._stages.resourceStates.filter(s => path.basename(s.resourceUri.fsPath) !== stageFilePath),
                        {
                            resourceUri: toMeltosUri(stageFilePath)
                        }
                    ];
                }
            }
        );
        this.context.subscriptions.push(command);
    };

    private readonly registerCommitCommand = () => {
        const command = vscode.commands.registerCommand(
            "meltos.commit",
            async () => {
                await this.commitAll();
            }
        );
        this.context.subscriptions.push(command);
    };

    private readonly registerPushCommand = () => {
        const command = vscode.commands.registerCommand("meltos.push", async () => {
            await this.pushAll();
        });
        this.context.subscriptions.push(command);
    };

    private readonly registerMergeCommand = () => {
        const command = vscode.commands.registerCommand(
            "meltos.merge",
            async (source?: string) => {
                await this.merge(source);
            });
        this.context.subscriptions.push(command);
    };

    private readonly fetch = async () => {
        try {
            await this.tvn.fetch(this.sessionConfigs);
        } catch (e) {
            if (e instanceof Error) {
                vscode.window.showErrorMessage(e.message);
            }
        }
    };

    private readonly stage = (path: string) => {
        try {
            this.tvn.stage(path);
        } catch (e) {
            if (e instanceof Error) {
                vscode.window.showErrorMessage(e.message);
            }
        }
    };


    private readonly commitAll = async () => {
        const text = await vscode.window.showInputBox();
        if (text) {
            this.tvn.commit(text);
        }
    };

    private readonly pushAll = async () => {
        await this.tvn.push(this.sessionConfigs);
    };

    private readonly merge = async (sourceBranch?: string) => {
        const source = sourceBranch || (await vscode.window.showInputBox({
            placeHolder: "source branch"
        }));
        if (!source) {
            return;
        }

        try {
            const status = await this.tvn.merge(source);
            console.log(`merge status = ${status}`);
        } catch (e) {
            if (e instanceof Error) {
                vscode.window.showErrorMessage(e.message);
            }
        }
    };

    private readonly onResourceChange = (resourceUri: vscode.Uri) => {
        console.log(resourceUri);
        this._changes.resourceStates = [
            ...this._changes.resourceStates.filter(s => s.resourceUri.fsPath !== resourceUri.fsPath),
            {
                resourceUri,
                decorations: {
                    tooltip: "add stage",
                    light: {
                        iconPath: new ThemeIcon("diff-insert"),
                    },
                    dark: {
                        iconPath: new ThemeIcon("diff-insert"),
                    },
                },
                command: {
                    command: "meltos.stage",
                    title: "stage",
                    tooltip: "stage",

                    arguments: [path.basename(resourceUri.fsPath)],
                },
            },
        ];
    };
}
