import * as vscode from "vscode";
import { Uri, Webview } from "vscode";

import { StageMessage } from "meltos_ts_lib/src/scm/changes/ScmFromWebMessage";

import { VscodeNodeFs } from "../fs/VscodeNodeFs";

import { TvcProvider } from "./TvcProvider";
import { MemFS } from "../fs/MemFs";
import { SessionConfigs } from "../../wasm";

export class TvcScmViewProvider implements vscode.WebviewViewProvider {
    private _webView: Webview | undefined;
    private readonly _watcher: TvcProvider;

    private _emitter = new vscode.EventEmitter<vscode.FileChangeEvent[]>();
    readonly onDidChangeFile: vscode.Event<vscode.FileChangeEvent[]> =
        this._emitter.event;

    constructor(
        private readonly context: vscode.ExtensionContext,
        private readonly sessionConfigs: SessionConfigs,
        tvc: any,
        fileSystem: VscodeNodeFs | MemFS
    ) {
        this._watcher = new TvcProvider(tvc, fileSystem);
    }

    resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext<unknown>,
        token: vscode.CancellationToken
    ): void | Thenable<void> {
        webviewView.webview.options = {
            enableScripts: true,
        };

        webviewView.webview.html = this._getWebviewContent(
            webviewView.webview,
            this.context.extensionUri
        );

        webviewView.webview.onDidReceiveMessage(async (message) => {
            switch (message.type) {
                case "stage":
                    await this._watcher.stage(
                        (message as StageMessage).meta.filePath
                    );
                    break;
                case "commit":
                    await this._watcher.commit(message.commitText);
                    break;
                case "push":
                    await this._watcher.push(this.sessionConfigs);
                    break;
            }
        });
        webviewView.onDidChangeVisibility(async () => {
            if (webviewView.visible) {
                const message = await this._watcher.scmMetas();
                await this._webView?.postMessage(message);
            }
        });
        this._webView = webviewView.webview;
        this.registerOnUpdateScm();
    }

    private registerOnUpdateScm = () => {
        this._watcher.onUpdateScm(async (message) => {
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
        const nonce = this.getNonce();

        return /*html*/ `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta http-equiv="Content-Security-Policy" content="default-src 'none';  style-src 'unsafe-inline'; img-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
          <link rel="stylesheet" type="text/css" href="${stylesUri}">
          <title>Hello World</title>
        </head>
        <body>
          <div id="root"></div>
          <script type="module" nonce="${nonce}" src="${scriptUri}"></script>
        </body>
      </html>
    `;
    }

    private getNonce() {
        let text = "";
        const possible =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (let i = 0; i < 32; i++) {
            text += possible.charAt(
                Math.floor(Math.random() * possible.length)
            );
        }
        return text;
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
