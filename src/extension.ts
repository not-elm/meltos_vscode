import * as vscode from "vscode";
import {copyRealWorkspaceToVirtual, openWorkspacePathDialog, toMeltosUri,} from "./fs/util";
import {TvnSourceControl} from "./tvn/TvnSourceControl";
import {createOwnerArgs, createUserArgs, isOwner, loadArgs} from "./args";
import {SessionConfigs, WasmTvcClient} from "meltos_wasm";
import {VscodeNodeFs} from "./fs/VscodeNodeFs";
import {TvcScmViewProvider} from "./tvn/TvcScmViewProvider";

let scm: TvnSourceControl | undefined;
let fileSystem: VscodeNodeFs | undefined;

export function activate(context: vscode.ExtensionContext) {
    fileSystem = new VscodeNodeFs();
    context.subscriptions.push(
        vscode.workspace.registerFileSystemProvider("meltos", fileSystem, {
            isCaseSensitive: true,
        })
    );
    registerOpenRoomCommand(context);
    registerWorkspaceInitCommand(fileSystem, context);
    registerJoinRoomCommand(context);

    if (vscode.workspace.workspaceFolders?.[0].uri?.scheme === "meltos") {
        vscode.commands.executeCommand("meltos.init");
    }
}

export function deactivate() {
    scm?.dispose();
    fileSystem?.dispose();
}

const registerOpenRoomCommand = (context: vscode.ExtensionContext) => {
    context.subscriptions.push(
        vscode.commands.registerCommand("meltos.openRoom", async () => {
            const workspaceSource = await openWorkspacePathDialog();
            if (!workspaceSource) {
                return;
            }

            const args = createOwnerArgs(workspaceSource.fsPath);
            context.globalState.update("args", args);

            await vscode.commands.executeCommand(
                `vscode.openFolder`,
                vscode.Uri.parse("/").with({
                    scheme: "meltos",
                })
            );
        })
    );
};

const registerWorkspaceInitCommand = (
    fileSystem: vscode.FileSystemProvider,
    context: vscode.ExtensionContext
) => {
    const command = vscode.commands.registerCommand("meltos.init", async () => {
        fileSystem.delete(vscode.Uri.parse("meltos:/"), {recursive: true});
        const args = loadArgs(context);

        const meltos = await import("meltos_wasm");
        const tvc = new meltos.WasmTvcClient(args.userId, fileSystem);
        let sessionConfigs: SessionConfigs;
        if (isOwner(args)) {
            copyRealWorkspaceToVirtual(args.workspaceSource, fileSystem);
            sessionConfigs = await tvc.open_room(BigInt(60 * 60));
        } else {
            // sessionConfigs = await tvnClient.join_room(args.roomId!, args.userId);
            sessionConfigs = await tvc.open_room(BigInt(60 * 60));
        }
        registerScmView(context, tvc, fileSystem);
        fileSystem.writeFile(
            toMeltosUri("sessionConfigs"),
            Buffer.from(sessionConfigs.room_id[0]),
            {
                create: true,
                overwrite: true,
            }
        );

        // scm = new TvnSourceControl(sessionConfigs, context, tvnClient);
    });
    context.subscriptions.push(command);
};

const registerJoinRoomCommand = (context: vscode.ExtensionContext) => {
    context.subscriptions.push(
        vscode.commands.registerCommand("meltos.joinRoom", async () => {
            const userInput = await vscode.window.showInputBox({
                placeHolder: "userName@roomId",
            });
            if (!userInput) {
                return;
            }

            const args = createUserArgs(userInput);
            context.globalState.update("args", args);
            await vscode.commands.executeCommand(
                `vscode.openFolder`,
                vscode.Uri.parse("meltos:/"),
                {
                    forceNewWindow: true,
                }
            );
        })
    );
};

const registerScmView = (
    context: vscode.ExtensionContext,
    tvc: WasmTvcClient,
    fileSystem: vscode.FileSystemProvider
) => {
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            "meltos.scm",
            new TvcScmViewProvider(context, tvc, fileSystem)
        )
    );
};
