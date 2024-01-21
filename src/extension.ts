import * as vscode from "vscode";
import {copyRealWorkspaceToVirtual, openWorkspacePathDialog,} from "./fs/util";
import {createOwnerArgs, createUserArgs, isOwner, loadArgs} from "./args";

import {VscodeNodeFs} from "./fs/VscodeNodeFs";

import {MemFS} from "./fs/MemFs";
import {SessionConfigs, WasmTvcClient} from "../wasm";

import {DiscussionTreeProvider} from "./discussion/DiscussionTreeProvider";
import {InMemoryDiscussionIo} from "./discussion/io/InMemory";
import {DiscussionIo,} from "./discussion/io/DiscussionIo";
import {DiscussionWebViewManager} from "./discussion/DiscussionWebView";
import {HttpRoomClient} from "./http";
import {ChannelWebsocket} from "./ChannelWebsocket";
import {registerShowHistoryCommand} from "./tvc/TvcHistoryWebView";
import {ObjFileProvider} from "./tvc/ObjFileProvider";
import {TvcScmWebView} from "./tvc/TvcScmWebView";
import {copy} from "copy-paste";
import {DiscussionProvider} from "./discussion/DiscussionProvider";
import {BundleType} from "meltos_ts_lib/src/tvc/Bundle";

let websocket: ChannelWebsocket | undefined;
let discussionWebviewManager: DiscussionWebViewManager | undefined;
let httpRoomClient: HttpRoomClient | undefined;

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

export async function deactivate() {
    await httpRoomClient?.leave();
    websocket?.dispose();
    discussionWebviewManager?.dispose();
}

const registerOpenRoomCommand = (context: vscode.ExtensionContext) => {
    context.subscriptions.push(
        vscode.commands.registerCommand("meltos.openRoom", async () => {
            const workspaceSource = await openWorkspacePathDialog();
            if (!workspaceSource) {
                return;
            }

            const args = createOwnerArgs(workspaceSource.fsPath);
            await context.globalState.update("args", args);
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
        fileSystem.delete(vscode.Uri.parse("meltos:/"), {recursive: true});

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
        registerDiscussion(context, sessionConfigs, tvc, meltos);
        registerClipboardRoomIdCommand(context, sessionConfigs.room_id[0]);

        const objProvider = new ObjFileProvider(tvc);
        vscode.workspace.registerTextDocumentContentProvider(
            "tvc",
            objProvider
        );
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
    config: SessionConfigs,
    tvc: WasmTvcClient,
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
    websocket = new ChannelWebsocket(provider, config);
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
        vscode.commands.registerCommand(
            "meltos.discussion.create",
            async () => {
                const title = await vscode.window.showInputBox({
                    placeHolder: "discussion title",
                });
                if (title) {
                    await http.create(title);
                }
            }
        )
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
                const meta = io.discussionIds().find(meta => meta.id === discussionId);
                if (meta) {
                    await web.show(meta);
                } else {
                    vscode.window.showErrorMessage(`not found discussion id = ${discussionId}`)
                }
            }
        )
    );
};

const registerClipboardRoomIdCommand = (context: vscode.ExtensionContext, roomId: string) => {
    context.subscriptions.push(vscode.commands.registerCommand("meltos.clipboard.roomId", () => {
        copy(roomId, () => {
            vscode.window.showInformationMessage("copied room id");
        });
    }));
};

const registerSyncCommand = (
    context: vscode.ExtensionContext,
    http: HttpRoomClient,
    discussion: DiscussionProvider,
    tvc: WasmTvcClient, meltos: any
) => {
    context.subscriptions.push(vscode.commands.registerCommand("meltos.sync", async () => {
        try {
            const roomBundle = await http.sync();

            await discussion.sync(roomBundle.discussion);
            tvc.save_bundle(convertToWasmBundle(roomBundle.tvc, meltos));
            vscode.window.showInformationMessage("synced room!");
        } catch (e) {
            console.error(e);
            vscode.window.showErrorMessage("failed sync room");
        }
    }));
};


const convertToWasmBundle = (bundle: BundleType, meltos: any) => {
    const traces = bundle
        .traces
        .map(t => new meltos.BundleTrace(t.commit_hash, t.obj_hash));
    const objs = bundle
        .objs
        .map(o => new meltos.BundleObject(o.hash, o.compressed_buf));
    const branches = bundle
        .branches
        .map(b => new meltos.BundleBranch(b.branch_name, b.commits));

    return new meltos.Bundle(traces, objs, branches);
}