import vscode, { Uri, Webview, WebviewPanel } from "vscode";
import { getNonce } from "../nonce";
import { WasmTvcClient } from "../../wasm";

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

    constructor(private readonly tvc: WasmTvcClient) {}

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
            this.postMessage();
        }
    }

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
