import * as vscode from "vscode";
import { Uri, Webview } from "vscode";

import { StageMessage } from "meltos_ts_lib/src/scm/changes/ScmFromWebMessage";

import { SessionConfigs } from "../../wasm";
import { codiconsCssDir, codiconsCssPath, getNonce } from "../webviewUtil";
import { toMeltosUri } from "../fs/util";

import { sleep } from "../test/util";
import { TvcProvider } from "../tvc/TvcProvider";
import { openObjDiff } from "../tvc/ObjFileProvider";

export class TvcScmWebView implements vscode.WebviewViewProvider {
    private _webView: Webview | undefined;

    private _emitter = new vscode.EventEmitter<vscode.FileChangeEvent[]>();
    readonly onDidChangeFile: vscode.Event<vscode.FileChangeEvent[]> =
        this._emitter.event;

    constructor(
        private readonly context: vscode.ExtensionContext,
        private readonly sessionConfigs: SessionConfigs,
        private readonly _provider: TvcProvider
    ) {
        this.registerFetchCommand(context);
    }

    private readonly registerFetchCommand = (
        context: vscode.ExtensionContext
    ) => {
        context.subscriptions.push(
            vscode.commands.registerCommand("meltos.fetch", async () => {
                await this._provider.fetch(this.sessionConfigs);
            })
        );
    };

    async resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext<unknown>,
        token: vscode.CancellationToken
    ) {
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                codiconsCssDir(this.context.extensionUri),
                vscode.Uri.joinPath(
                    this.context.extensionUri,
                    "ui",
                    "tvc_scm",
                    "build",
                    "assets"
                ),
            ],
        };

        webviewView.webview.html = this._getWebviewContent(
            webviewView.webview,
            this.context.extensionUri
        );

        webviewView.webview.onDidReceiveMessage(async (message) => {
            switch (message.type) {
                case "stage":
                    await this._provider.stage(
                        (message as StageMessage).meta?.filePath || null
                    );
                    break;
                case "commit":
                    await this._provider.commit(message.commitText);
                    await this._webView?.postMessage(this._provider.scmMetas());
                    break;
                case "push":
                    await this._provider.push(this.sessionConfigs);
                    await this._webView?.postMessage(this._provider.scmMetas());
                    break;
                case "showDiff":
                    await openObjDiff(message.meta);
                    break;
                case "openFile":
                    await vscode.commands.executeCommand(
                        "vscode.open",
                        toMeltosUri(message.filePath)
                    );
                    break;
                case "unStage":
                    await this._provider.unStage(message.filePath);
                    break;
            }
        });

        webviewView.onDidChangeVisibility(async () => {
            if (webviewView.visible) {
                const message = this._provider.scmMetas();
                await this._webView?.postMessage(message);
            }
        });
        this._webView = webviewView.webview;
        this.registerOnUpdateScm();
        await sleep(800);
        await this._webView?.postMessage(this._provider.scmMetas());
    }

    private registerOnUpdateScm = () => {
        this._provider.onUpdateScm(async (message) => {
            await this._webView?.postMessage(message);
        });
    };

    private _getWebviewContent(webview: Webview, extensionUri: Uri) {
        const stylesUri = webview.asWebviewUri(
            vscode.Uri.joinPath(
                extensionUri,
                "ui",
                "tvc_scm",
                "build",
                "assets",
                "index.css"
            )
        );
        const scriptUri = webview.asWebviewUri(
            vscode.Uri.joinPath(
                extensionUri,
                "ui",
                "tvc_scm",
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
          <title>Hello World</title>
        </head>
        <body>
          <div id="root"></div>
          <script type="module" nonce="${nonce}" src="${scriptUri}"></script>
        </body>
      </html>
    `;
    }
}

const fromFileChangeType = (ty: vscode.FileChangeType) => {
    switch (ty) {
        case vscode.FileChangeType.Changed:
            return "change";
        case vscode.FileChangeType.Created:
            return "create";
        case vscode.FileChangeType.Deleted:
            return "delete";
    }
};