import * as vscode from 'vscode';
import {copyRealWorkspaceToVirtual, toMeltosUri} from './fs/util';
import {TvnSourceControl} from './tvn/TvnSourceControl';
import {isOwner, loadArgs} from "./args";
import {MemFS} from "./fs/fileSystemProvider";
import {SessionConfigs} from 'meltos_client';

let scm: TvnSourceControl | undefined;

export function activate(context: vscode.ExtensionContext) {
    const fileSystem = new MemFS();
    context.subscriptions.push(vscode.workspace.registerFileSystemProvider("meltos", fileSystem, {
        isCaseSensitive: true
    }));

    const command = vscode.commands.registerCommand("meltos.init", async () => {
        // fileSystem.clearMeltosDirs();
        const meltosClient = await import("meltos_client");
        const args = loadArgs();
        const tvnClient = new meltosClient.TvnClient(args.userId, fileSystem);
        let sessionConfigs: SessionConfigs;
        if (isOwner(args)) {
            copyRealWorkspaceToVirtual(args.workspaceSource, fileSystem);
            sessionConfigs = await tvnClient.open_room(BigInt(60 * 60));
        } else {
            sessionConfigs = await tvnClient.join_room(args.roomId!, args.userId);
        }

        scm = new TvnSourceControl(sessionConfigs, context, tvnClient);
        fileSystem.writeFile(toMeltosUri("sessionConfigs"), Buffer.from(sessionConfigs.room_id[0]), {
            create: true,
            overwrite: true
        });
    });

    context.subscriptions.push(command);
    vscode.commands.executeCommand("meltos.init");
}

export function deactivate() {
    scm?.dispose();
}
