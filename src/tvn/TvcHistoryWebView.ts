import vscode, {Uri, Webview, WebviewPanel} from "vscode";
import {getNonce} from "../nonce";
import {ObjMeta, WasmTvcClient} from "../../wasm";
import {showObjFile} from "./ObjFileProvider";
import {ShowFileMessage,} from "meltos_ts_lib/dist/scm/hitory/HistoryFromWebMessage";

export const registerShowHistoryCommand = (
    context: vscode.ExtensionContext,
    tvc: WasmTvcClient
) => {
    const view = new TvcHistoryWebView(tvc);
    context.subscriptions.push(
        vscode.commands.registerCommand("meltos.tvc.showHistory", () => {
            view.show(context);
        })
    );
};

export class TvcHistoryWebView {
    private panel: WebviewPanel | undefined;

    constructor(private readonly tvc: WasmTvcClient) {
    }

    show(context: vscode.ExtensionContext) {
        if (this.panel) {
            this.panel.reveal();
            this.postMessage();
        } else {
            const panel = vscode.window.createWebviewPanel(
                "meltos.tvc.historyView",
                "TvcHistory",
                vscode.ViewColumn.One
            );

            panel.webview.options = {
                enableScripts: true,
            };

            panel.webview.html = this.getWebviewContent(
                panel.webview,
                context.extensionUri
            );
            this.panel = panel;
            this.onReceiveMessage();
            this.postMessage();
            this.panel.onDidDispose(() => {
                this.panel = undefined;
            });
        }
    }

    private onReceiveMessage() {
        this.panel?.webview.onDidReceiveMessage(async (message) => {
            switch (message.type) {
                case "showFile":
                    await showObjFile((message as ShowFileMessage).meta.hash);
                    break;
                case "diffFromWorkspace":
                    await this.showDiffFromWorkspace(message.meta);
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

    private postMessage() {
        const commits = this.tvc.all_commit_metas();
        this.panel?.webview.postMessage({
            data: commits.map((c) => ({
                hash: c.hash,
                message: c.message,
                objs: c.objs.map((o) => ({
                    file_path: o.file_path,
                    hash: o.hash,
                })),
            })),
        });
    }

    private getWebviewContent(webview: Webview, extensionUri: Uri) {
        const stylesUri = webview.asWebviewUri(
            vscode.Uri.joinPath(
                extensionUri,
                "ui",
                "tvc_history",
                "build",
                "assets",
                "index.css"
            )
        );
        const scriptUri = webview.asWebviewUri(
            vscode.Uri.joinPath(
                extensionUri,
                "ui",
                "tvc_history",
                "build",
                "assets",
                "index.js"
            )
        );
        const nonce = getNonce();

        return /*html*/ `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta http-equiv="Content-Security-Policy" content="default-src 'none';  style-src 'unsafe-inline'; img-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
          <link rel="stylesheet" type="text/css" href="${stylesUri}">
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
