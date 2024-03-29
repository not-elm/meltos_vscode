import vscode, { Uri, Webview, WebviewPanel } from "vscode";
import { codiconsCssDir, codiconsCssPath, getNonce } from "../webviewUtil";
import { ObjMeta, WasmTvcClient } from "../../wasm";
import { openObjFile } from "./ObjFileProvider";
import {
    MergeMessage,
    ShowFileMessage,
} from "meltos_ts_lib/src/scm/hitory/HistoryFromWebMessage";
import { sleep } from "../test/util";

export const registerShowHistoryCommand = (
    context: vscode.ExtensionContext,
    view: CommitHistoryWebView
) => {
    context.subscriptions.push(
        vscode.commands.registerCommand("meltos.tvc.showHistory", async () => {
            await view.show(context);
        })
    );
};

export class CommitHistoryWebView {
    private panel: WebviewPanel | undefined;

    constructor(
        private readonly branchName: string,
        private readonly tvc: WasmTvcClient
    ) {}

    async show(context: vscode.ExtensionContext) {
        if (this.panel) {
            this.panel.reveal();
            await sleep(300);
            await this.postMessage();
        } else {
            this.panel = this.createWebviewPanel(context);
            this.onDidChangeViewState();
            this.onReceiveMessage();
            await sleep(300);
            await this.postMessage();
            this.panel.onDidDispose(() => {
                this.panel = undefined;
            });
        }
    }

    private createWebviewPanel(context: vscode.ExtensionContext) {
        const panel = vscode.window.createWebviewPanel(
            "meltos.tvc.historyView",
            "TvcHistory",
            vscode.ViewColumn.One
        );

        panel.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                codiconsCssDir(context.extensionUri),
                vscode.Uri.joinPath(
                    context.extensionUri,
                    "media"
                ),
            ],
        };
        panel.webview.html = this.getWebviewContent(
            panel.webview,
            context.extensionUri
        );
        return panel;
    }

    private onDidChangeViewState() {
        this.panel?.onDidChangeViewState(async (v) => {
            if (v.webviewPanel.visible) {
                await this.postMessage();
            }
        });
    }

    private onReceiveMessage() {
        this.panel?.webview.onDidReceiveMessage(async (message) => {
            switch (message.type) {
                case "showFile":
                    await openObjFile((message as ShowFileMessage).meta.hash);
                    break;
                case "diffFromWorkspace":
                    await this.showDiffFromWorkspace(message.meta);
                    break;
                case "merge":
                    await this.merge((message as MergeMessage).commitHash);
                    break;
            }
        });
    }

    private readonly showDiffFromWorkspace = async (obj: ObjMeta) => {
        await vscode.commands.executeCommand(
            "vscode.diff",
            vscode.Uri.parse(`tvc:/${obj.hash}`),
            vscode.Uri.parse(`meltos:/${obj.file_path}`),
            `diff(tvc ↔ workspace)`
        );
    };

    private readonly merge = async (commitHash: string) => {
        try {
            await this.tvc.merge(this.branchName, commitHash);
            await this.postMessage();
            vscode.window.showInformationMessage("merge succeed");
        } catch (e) {
            vscode.window.showErrorMessage(`merge failed! ${e}`);
        }
    };

    async postMessage() {
        const branchCommits = (await this.tvc.all_branch_commit_metas())[0];

        const branches = branchCommits.map((b) => ({
            name: b.name,
            commits: b.commits.map((c) => ({
                hash: c.hash,
                message: c.message,
                objs: c.objs.map((o) => ({
                    hash: o.hash,
                    file_path: o.file_path,
                })),
            })),
        }));
        this.panel?.webview.postMessage(branches);
    }

    private getWebviewContent(webview: Webview, extensionUri: Uri) {
        const stylesUri = webview.asWebviewUri(
            vscode.Uri.joinPath(
                extensionUri,
                "media",
                "commit_history",
                "index.css"
            )
        );
        const scriptUri = webview.asWebviewUri(
            vscode.Uri.joinPath(
                extensionUri,
                "media",
                "commit_history",
                "index.js"
            )
        );
        const nonce = getNonce();
        const codiconsUri = webview.asWebviewUri(codiconsCssPath(extensionUri));

        return /*html*/ `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta http-equiv="Content-Security-Policy" content="default-src 'none'; font-src ${webview.cspSource}; style-src ${webview.cspSource} 'unsafe-inline'; script-src ${webview.cspSource}; img-src ${webview.cspSource};">
          <link rel="stylesheet" type="text/css" href="${stylesUri}">
          <link href="${codiconsUri}" rel="stylesheet" />  
          <title>Tvc History</title>
        </head>
        <body>         
          <div id="root"></div>
          <script type="module" nonce="${nonce}" src="${scriptUri}"></script>
        </body>
      </html>
    `;
    }
}
