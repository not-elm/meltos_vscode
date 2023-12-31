import vscode from "vscode";
import {SessionConfigs, TvnClient} from "meltos_client";

export class TvnSourceControl implements vscode.Disposable {
    private readonly _sc: vscode.SourceControl;
    private readonly _changes: vscode.SourceControlResourceGroup;

    constructor(
        private readonly sessionConfigs: SessionConfigs,
        private readonly context: vscode.ExtensionContext,
        private readonly tvn: TvnClient,
    ) {
        this._sc = vscode.scm.createSourceControl(
            "meltos",
            "meltos",
            vscode.Uri.parse("meltos:/")
        );

        this._changes = this._sc.createResourceGroup("workingTree", "changes");

        const watcher = vscode.workspace.createFileSystemWatcher(
            new vscode.RelativePattern(vscode.Uri.parse("meltos:/workspace"), "*.*")
        );
        watcher.onDidCreate(this.onResourceChange);
        watcher.onDidChange(this.onResourceChange);

        this.registerFetchCommand();
        this.registerStageCommand();
        this.registerCommitCommand();
        this.registerPushCommand();
        context.subscriptions.push(this._sc);
    }

    dispose() {
        this._sc.dispose();
    }

    private readonly registerFetchCommand = () => {
        const command = vscode.commands.registerCommand("meltos.fetch", async () => {
            await this.fetch();
        });
        this.context.subscriptions.push(command);
    };

    private readonly registerStageCommand = () => {
        const command = vscode.commands.registerCommand("meltos.stage", async () => {
            let path = await vscode.window.showInputBox();
            if (path) {
                this.stage(path);
            }
        });
        this.context.subscriptions.push(command);
    };

    private readonly registerCommitCommand = () => {
        const command = vscode.commands.registerCommand("meltos.commit", async () => {
            await this.commitAll();
        });
        this.context.subscriptions.push(command);
    };

    private readonly registerPushCommand = () => {
        const command = vscode.commands.registerCommand("meltos.push", async () => {
            await this.pushAll();
        });
        this.context.subscriptions.push(command);
    };

    private readonly fetch = async () => {
        // try {
        //     await this.tvn.fetch();
        // } catch (e) {
        //     if (e instanceof Error) {
        //         vscode.window.showErrorMessage(e.message);
        //     }
        // }
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

    private readonly onResourceChange = (resourceUri: vscode.Uri) => {
        console.log(resourceUri);
        this._changes.resourceStates = [
            {
                resourceUri,
            },
        ];
    };
}
