import * as vscode from "vscode";
import { Uri, Webview } from "vscode";
import { WasmTvcClient } from "meltos_wasm";
import {
	ChangeMessage,
	InitialMessage,
	StagedMessage,
} from "meltos_ts_lib/src/scm/changes/ScmToWebMessage";
import { StageMessage } from "meltos_ts_lib/src/scm/changes/ScmFromWebMessage";
import { ChangeMeta } from "meltos_ts_lib/src/scm/changes";
import { VscodeNodeFs } from "../fs/VscodeNodeFs";
import { TvcChangeHistory } from "./TvcChangeHistory";

export class TvcScmViewProvider implements vscode.WebviewViewProvider {
	private _webView: Webview | undefined;
	private readonly _watcher: TvcChangeHistory;

	constructor(
		private readonly context: vscode.ExtensionContext,
		private readonly tvc: WasmTvcClient,
		private readonly fileSystem: vscode.FileSystemProvider
	) {
		this._watcher = new TvcChangeHistory(fileSystem, tvc);
		this.registerChangeFileEvents();
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
					await this.stage(webviewView.webview, message as StageMessage);
					break;
			}
		});
		webviewView.onDidChangeVisibility(async () => {
			if (webviewView.visible) {
				await this.sendInitialMessage();
			}
		});
		this._webView = webviewView.webview;
	}

	private registerChangeFileEvents() {
		this.fileSystem.onDidChangeFile(async (changes) => {
			for (const event of changes.filter((c) =>
				c.uri.path.startsWith("/workspace/")
			)) {
				const changes = await this._watcher.inspectChangeStatus(event);
				this._webView?.postMessage({
					type: "initial",
					changes,
					stages: []
				} as InitialMessage);
			}
		});
	}

	private readonly sendStagingFiles = async () => {
		const files = this.tvc.staging_files();
		for (const filePath of files) {
			await this.sendStageFile({
				changeType: "create",
				filePath,
			});
		}
	};

	private readonly sendInitialMessage = async () => {
		const changes = await this._watcher.loadChanges();
		await this._webView?.postMessage({
			type: "initial",
			changes: changes,
			stages: []
		} as InitialMessage);
	};

	private readonly stage = async (
		webView: Webview,
		stageMessage: StageMessage
	) => {
		this.tvc.stage(stageMessage.meta.filePath);
		await this.sendStageFile(stageMessage.meta);
	};

	private readonly sendStageFile = async (meta: ChangeMeta) => {
		await this._webView?.postMessage({
			type: "staged",
			meta,
		} as StagedMessage);
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
			text += possible.charAt(Math.floor(Math.random() * possible.length));
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
