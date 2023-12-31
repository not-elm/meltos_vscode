import * as vscode from 'vscode';
import {StorageFs} from "./fs/StorageFs";
import * as fs from "fs";
import {copyRealWorkspaceToVirtual} from './fs/util';
import * as path from "node:path";


export function activate(context: vscode.ExtensionContext) {
    const fileSystem = new StorageFs();
    context.subscriptions.push(vscode.workspace.registerFileSystemProvider("meltos", fileSystem, {
        isCaseSensitive: true
    }));


    const command = vscode.commands.registerCommand("meltos.open", async () => {
        const meltosClient = await import("meltos_client");
        const userId = await vscode.window.showInputBox({
            placeHolder: "userName"
        });
        if (userId) {
            const dir = fs.readFileSync(path.join(process.env.APPDATA!, "meltos", "SOURCE")).toString();
            copyRealWorkspaceToVirtual(dir, fileSystem);

            const tvnClient = new meltosClient.TvnClient(userId, fileSystem);
            tvnClient.init();
        }
    });

    context.subscriptions.push(command);
    vscode.commands.executeCommand("meltos.open");
}


export function deactivate() {
}
