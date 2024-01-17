import vscode, {Uri, Webview, WebviewPanel} from "vscode";
import {codiconsCssDir, codiconsCssPath, getNonce} from "../webviewUtil";
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
            this.panel = this.createWebviewPanel(context);
            this.onDidChangeViewState();
            this.onReceiveMessage();
            this.postMessage();
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
                    "ui",
                    "tvc_history",
                    "build",
                    "assets"
                ),
            ]
        };
        panel.webview.html = this.getWebviewContent(
            panel.webview,
            context.extensionUri
        );
        return panel;
    };


    private onDidChangeViewState() {
        this.panel?.onDidChangeViewState(v => {
            if (v.webviewPanel.visible) {
                this.postMessage();
            }
        });
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
        const comm = commits.map((c) => ({
            hash: c.hash,
            message: c.message,
            objs: c.objs.map((o) => ({
                file_path: o.file_path,
                hash: o.hash,
            })),
        }));

        this.panel?.webview.postMessage([{
            name: "owner",
            commits: comm
        }]);
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
