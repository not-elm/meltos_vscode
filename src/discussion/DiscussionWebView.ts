import * as vscode from "vscode";
import {Uri, Webview} from "vscode";
import {DiscussionIo} from "./io/DiscussionIo";
import {HttpRoomClient} from "../http";
import {DiscussionMetaType} from "../types/api";

export class DiscussionWebViewManager implements AsyncDisposable {
    private readonly _views = new Map<string, DiscussionWebView>();

    constructor(
        private readonly context: vscode.ExtensionContext,
        private readonly io: DiscussionIo,
        private readonly client: HttpRoomClient
    ) {
    }

    async [Symbol.asyncDispose](): Promise<void> {
        for (const v of this._views.values()) {
            await v[Symbol.asyncDispose]();
        }
    }

    async notifyAll() {
        for (const view of this._views.values()) {
            await view.notify();
        }
    }

    async notify(discussionId: string) {
        const view = this._views.get(discussionId);
        if (view) {
            await view.notify();
        }
    }

    async show(meta: DiscussionMetaType) {
        const view = this._views.get(meta.id);
        if (view) {
            await view.notify();
        } else {
            const newView = new DiscussionWebView(
                this.context,
                this.io,
                meta,
                this.client
            );
            newView.panel.onDidDispose(() => this._views.delete(meta.id));
            this._views.set(meta.id, newView);
        }
    }
}

export class DiscussionWebView implements AsyncDisposable {
    static readonly viewType = "discussion";
    private readonly _panel: vscode.WebviewPanel;

    constructor(
        private readonly context: vscode.ExtensionContext,
        private readonly io: DiscussionIo,
        private readonly meta: DiscussionMetaType,
        private readonly client: HttpRoomClient
    ) {
        this._panel = this.createWebView();
        this.notify();
    }

    get panel() {
        return this._panel;
    }

    async [Symbol.asyncDispose](): Promise<void> {
        this._panel.dispose();
    }

    async notify() {
        const data = this.io.discussion(this.meta.id);
        await this._panel.webview.postMessage({
            type: "discussion",
            data,
        });
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

    private createWebView() {
        const panel = vscode.window.createWebviewPanel(
            DiscussionWebView.viewType,
            this.meta.title,
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                localResourceRoots: [
                    vscode.Uri.joinPath(this.context.extensionUri, "media"),
                    vscode.Uri.joinPath(
                        this.context.extensionUri,
                        "webview-ui",
                        "build"
                    ),
                    vscode.Uri.joinPath(
                        this.context.extensionUri,
                        "webview-ui",
                        "build",
                        "assets"
                    ),
                ],
            }
        );

        panel.webview.html = this._getWebviewContent(
            panel.webview,
            this.context.extensionUri
        );
        panel.webview.onDidReceiveMessage(async (e) => {
            if (e.type === "speak") {
                await this.client.speak(this.meta.id, e.text);
            } else if (e.type === "reply") {
                await this.client.reply(e.to, e.text);
            }
        });
        return panel;
    }

    private _getWebviewContent(webview: Webview, extensionUri: Uri) {
        const stylesUri = webview.asWebviewUri(
            vscode.Uri.joinPath(
                extensionUri,
                "webview-ui",
                "build",
                "assets",
                "index.css"
            )
        );
        const scriptUri = webview.asWebviewUri(
            vscode.Uri.joinPath(
                extensionUri,
                "webview-ui",
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
          <meta http-equiv="Content-Security-Policy" content="default-src 'none';  style-src ${webview.cspSource}; img-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
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
}
