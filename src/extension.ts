import * as vscode from "vscode";
import {Uri} from "vscode";
import {copyRealWorkspaceToVirtual, openWorkspacePathDialog} from "./fs/util";
import {createOwnerArgs, createUserArgs, isOwner, loadArgs} from "./args";

import {VscodeNodeFs} from "./fs/VscodeNodeFs";

import {MemFS} from "./fs/MemFs";
import {SessionConfigs} from "../wasm";

import {DiscussionTreeProvider} from "./discussion/DiscussionTreeProvider";
import {InMemoryDiscussionIo} from "./discussion/io/InMemory";
import {DiscussionIo} from "./discussion/io/DiscussionIo";
import {DiscussionWebViewManager} from "./discussion/DiscussionWebView";
import {HttpRoomClient} from "./http";
import {ChannelWebsocket} from "./ChannelWebsocket";
import {registerShowHistoryCommand, TvcHistoryWebView} from "./tvc/TvcHistoryWebView";
import {ObjFileProvider} from "./tvc/ObjFileProvider";
import {TvcScmWebView} from "./tvc/TvcScmWebView";
import {copy} from "copy-paste";
import {DiscussionProvider} from "./discussion/DiscussionProvider";
import {BundleType} from "meltos_ts_lib/src/tvc/Bundle";
import {TvcProvider} from "./tvc/TvcProvider";

let websocket: ChannelWebsocket | undefined;
let discussionWebviewManager: DiscussionWebViewManager | undefined;
let httpRoomClient: HttpRoomClient | undefined;
const fileSystem = new VscodeNodeFs();

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.workspace.registerFileSystemProvider("meltos", fileSystem, {
            isCaseSensitive: true,
        })
    );

    registerOpenRoomCommand(context, fileSystem);
    registerWorkspaceInitCommand(context, fileSystem);
    registerJoinRoomCommand(context);

    const folder = vscode.workspace.getWorkspaceFolder(
        vscode.Uri.parse("meltos:/")
    );

    if (folder) {
        vscode.commands.executeCommand("meltos.init");
    }
}

export async function deactivate() {
    await httpRoomClient?.leave();
    websocket?.dispose();
    discussionWebviewManager?.dispose();
    vscode.workspace.updateWorkspaceFolders(0, vscode.workspace.workspaceFolders?.length);
}

const registerWorkspaceInitCommand = (
    context: vscode.ExtensionContext,
    fileSystem: MemFS | VscodeNodeFs
) => {
    const command = vscode.commands.registerCommand("meltos.init", async () => {
        fileSystem.deleteApi(".");

        const args = loadArgs(context);
        console.log(args);
        const meltos = await import("../wasm/index.js");
        const tvc = new meltos.WasmTvcClient(args.userId, fileSystem);
        const view = new TvcHistoryWebView(tvc);
        const provider = new TvcProvider(tvc, view, meltos,  fileSystem);
        let sessionConfigs: SessionConfigs;
        if (isOwner(args)) {
            copyRealWorkspaceToVirtual(args.workspaceSource, fileSystem);
            sessionConfigs = await tvc.open_room(BigInt(60 * 60));
        } else {
            sessionConfigs = await tvc.join_room(args.roomId!, args.userId);
        }
        registerShowHistoryCommand(context, view);
        registerScmView(context, sessionConfigs, provider);
        registerDiscussion(context, sessionConfigs, provider, meltos);
        registerClipboardRoomIdCommand(context, sessionConfigs.room_id[0]);

        const objProvider = new ObjFileProvider(tvc);
        vscode.workspace.registerTextDocumentContentProvider("tvc", objProvider);
    });
    context.subscriptions.push(command);
};

const registerOpenRoomCommand = (
    context: vscode.ExtensionContext,
    fileSystem: vscode.FileSystemProvider
) => {
    context.subscriptions.push(
        vscode.commands.registerCommand("meltos.openRoom", async () => {
            const workspaceSource = await openWorkspacePathDialog();
            if (!workspaceSource) {
                return;
            }

            const args = createOwnerArgs(workspaceSource.fsPath);
            await context.globalState.update("args", args);

            vscode.workspace.updateWorkspaceFolders(
                0,
                null,
                {
                    uri: Uri.parse(`meltos:/`),
                    name: args.userId,
                }
            );

            // await vscode.commands.executeCommand("meltos.init");
        })
    );
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
            vscode.workspace.updateWorkspaceFolders(
                0,
                null,
                {
                    uri: Uri.parse(`meltos:/`),
                    name: args.userId,
                }
            );
        })
    );
};

const registerScmView = (
    context: vscode.ExtensionContext,
    sessionConfigs: SessionConfigs,
    provider: TvcProvider
) => {
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            "meltos.scm",
            new TvcScmWebView(context, sessionConfigs, provider)
        )
    );
};

const registerDiscussion = (
    context: vscode.ExtensionContext,
    config: SessionConfigs,
    tvc: TvcProvider,
    meltos: any
) => {
    const io = new InMemoryDiscussionIo();
    const tree = new DiscussionTreeProvider(io);
    const http = new HttpRoomClient({
        room_id: config.room_id[0],
        session_id: config.session_id[0],
        user_id: config.user_id[0],
    });
    httpRoomClient = http;
    const web = new DiscussionWebViewManager(context, io, http);
    discussionWebviewManager = web;
    const provider = new DiscussionProvider(io, tree, web);
    websocket = new ChannelWebsocket(provider, tvc, config);
    websocket.connectChannel(config.room_id[0], config.session_id[0]);

    vscode.window.registerTreeDataProvider("meltos.discussions", tree);
    registerCreateDiscussion(context, http);
    registerShowDiscussion(context, web, io);
    registerSyncCommand(context, http, provider, tvc, meltos);
};

const registerCreateDiscussion = (
    context: vscode.ExtensionContext,
    http: HttpRoomClient
) => {
    context.subscriptions.push(
        vscode.commands.registerCommand("meltos.discussion.create", async () => {
            const title = await vscode.window.showInputBox({
                placeHolder: "discussion title",
            });
            if (title) {
                await http.create(title);
            }
        })
    );
};

const registerShowDiscussion = (
    context: vscode.ExtensionContext,
    web: DiscussionWebViewManager,
    io: DiscussionIo
) => {
    context.subscriptions.push(
        vscode.commands.registerCommand(
            "meltos.discussion.show",
            async (discussionId: string) => {
                const meta = io
                    .discussionIds()
                    .find((meta) => meta.id === discussionId);
                if (meta) {
                    await web.show(meta);
                } else {
                    vscode.window.showErrorMessage(
                        `not found discussion id = ${discussionId}`
                    );
                }
            }
        )
    );
};

const registerClipboardRoomIdCommand = (
    context: vscode.ExtensionContext,
    roomId: string
) => {
    context.subscriptions.push(
        vscode.commands.registerCommand("meltos.clipboard.roomId", () => {
            copy(roomId, () => {
                vscode.window.showInformationMessage("copied room id");
            });
        })
    );
};

const registerSyncCommand = (
    context: vscode.ExtensionContext,
    http: HttpRoomClient,
    discussion: DiscussionProvider,
    tvc: TvcProvider,
    meltos: any
) => {
    context.subscriptions.push(
        vscode.commands.registerCommand("meltos.sync", async () => {
            try {
                const roomBundle = await http.sync();

                await discussion.sync(roomBundle.discussion);
                await tvc.saveBundle(convertToWasmBundle(roomBundle.tvc, meltos));
                vscode.window.showInformationMessage("synced room!");
            } catch (e) {
                console.error(e);
                vscode.window.showErrorMessage("failed sync room");
            }
        })
    );
};

export const convertToWasmBundle = (bundle: BundleType, meltos: any) => {
    const traces = bundle.traces.map(
        (t) => new meltos.BundleTrace(t.commit_hash, t.obj_hash)
    );
    const objs = bundle.objs.map(
        (o) => new meltos.BundleObject(o.hash, o.compressed_buf)
    );
    const branches = bundle.branches.map(
        (b) => new meltos.BundleBranch(b.branch_name, b.commits)
    );

    return new meltos.Bundle(traces, objs, branches);
};
