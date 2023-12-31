import * as vscode from 'vscode';
import {StorageFs} from "./fs/StorageFs";
import * as fs from "fs";
import {copyRealWorkspaceToVirtual} from './fs/util';
import * as path from "node:path";
import { TvnSourceControl } from './tvn/TvnSourceControl';

let scm: TvnSourceControl | undefined;

export function activate(context: vscode.ExtensionContext) {
    const fileSystem = new StorageFs();
    context.subscriptions.push(vscode.workspace.registerFileSystemProvider("meltos", fileSystem, {
        isCaseSensitive: true
    }));

    const command = vscode.commands.registerCommand("meltos.open", async () => {
       fileSystem.clearMeltosDirs();
        const meltosClient = await import("meltos_client");
        const userId = await vscode.window.showInputBox({
            placeHolder: "userName"
        });
        if (userId) {
            const dir = fs.readFileSync(path.join(process.env.APPDATA!, "meltos", "SOURCE")).toString();
            copyRealWorkspaceToVirtual(dir, fileSystem);

            const tvnClient = new meltosClient.TvnClient(userId, fileSystem);
            const sessionConfigs = await tvnClient.open_room(BigInt(60 * 60));
            scm = new TvnSourceControl(sessionConfigs, context, tvnClient);            
        }
    });

    context.subscriptions.push(command);
    vscode.commands.executeCommand("meltos.open");
}

export function deactivate() {
    scm?.dispose();
}
