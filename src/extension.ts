import * as vscode from "vscode";
import {
    copyRealWorkspaceToVirtual,
    openWorkspacePathDialog,
    toMeltosUri,
} from "./fs/util";
import { createOwnerArgs, createUserArgs, isOwner, loadArgs } from "./args";

import { VscodeNodeFs } from "./fs/VscodeNodeFs";
import { TvcScmWebView } from "./tvn/TvcScmWebView";
import { MemFS } from "./fs/MemFs";
import { SessionConfigs, WasmTvcClient } from "../wasm";
import { registerShowHistoryCommand } from "./tvn/TvcHistoryWebView";
import { ObjFileProvider } from "./tvn/ObjFileProvider";
import { DiscussionTreeProvider } from "./discussion/DiscussionTreeProvider";
import { InMemoryDiscussionIo } from './discussion/io/InMemory';
import { DiscussionProvider } from './discussion/io/DiscussionIo';
import { DiscussionWebViewManager } from "./discussion/DiscussionWebView";
import { HttpRoomClient } from "./http";

export function activate(context: vscode.ExtensionContext) {
    const fileSystem = new VscodeNodeFs();
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

export function deactivate() {}

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
    fileSystem: VscodeNodeFs | MemFS,
    context: vscode.ExtensionContext
) => {
    const command = vscode.commands.registerCommand("meltos.init", async () => {
        fileSystem.delete(vscode.Uri.parse("meltos:/"), { recursive: true });
        // fileSystem.writeFileApi("hello.txt", Buffer.from("hello"));

        const args = loadArgs(context);
        console.log(args);
        const meltos = await import("../wasm/index.js");
        const tvc = new meltos.WasmTvcClient(args.userId, fileSystem);
        let sessionConfigs: SessionConfigs;
        if (isOwner(args)) {
            copyRealWorkspaceToVirtual(args.workspaceSource, fileSystem);
            sessionConfigs = await tvc.open_room(BigInt(60 * 60));
        } else {
            sessionConfigs = await tvc.join_room(args.roomId!, args.userId);
        }
        registerShowHistoryCommand(context, tvc);
        registerScmView(context, sessionConfigs, tvc, fileSystem);
        registerDiscussion(context, sessionConfigs);

        const objProvider = new ObjFileProvider(tvc);
        vscode.workspace.registerTextDocumentContentProvider(
            "tvc",
            objProvider
        );

        fileSystem.writeFile(
            toMeltosUri("sessionConfigs"),
            Buffer.from(sessionConfigs.room_id[0]),
            {
                create: true,
                overwrite: true,
            }
        );

        return;
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
    sessionConfigs: SessionConfigs,
    tvc: WasmTvcClient,
    fileSystem: VscodeNodeFs | MemFS
) => {
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            "meltos.scm",
            new TvcScmWebView(context, sessionConfigs, tvc, fileSystem)
        )
    );
};

const registerDiscussion = (
    context: vscode.ExtensionContext,
    config: SessionConfigs
) => {
    const io = new InMemoryDiscussionIo();
    const tree = new DiscussionTreeProvider(io);
    const http = new HttpRoomClient({
        room_id: config.room_id[0],
        session_id: config.session_id[0],
        user_id: config.user_id[0]
    });

    const web = new DiscussionWebViewManager(context, io, http);
    const provider = new DiscussionProvider(io, tree, web);
    
    vscode.window.registerTreeDataProvider("meltos.discussionTree", tree);

};