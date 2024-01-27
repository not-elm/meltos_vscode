import * as vscode from "vscode";
import {Uri} from "vscode";
import {createOwnerArgs, createUserArgs, isOwner, OwnerArgs, UserArgs,} from "./args";
import {Bundle, SessionConfigs} from "../wasm";

import {DiscussionTreeProvider} from "./discussion/DiscussionTreeProvider";
import {InMemoryDiscussionIo} from "./discussion/io/InMemory";
import {DiscussionIo} from "./discussion/io/DiscussionIo";
import {DiscussionWebViewManager} from "./discussion/DiscussionWebView";
import {HttpRoomClient} from "./http";
import {ChannelWebsocket} from "./ChannelWebsocket";
import {CommitHistoryWebView, registerShowHistoryCommand,} from "./tvc/CommitHistoryWebView";
import {ObjFileProvider} from "./tvc/ObjFileProvider";

import {copy} from "copy-paste";
import {DiscussionProvider} from "./discussion/DiscussionProvider";
import {BundleType} from "meltos_ts_lib/src/tvc/Bundle";
import {TvcProvider} from "./tvc/TvcProvider";
import {SessionConfigsType} from "meltos_ts_lib/dist/SessionConfigs";
import {RootFileSystem} from "./fs/RootFileSystem";
import {copyRealWorkspaceToVirtual} from "./fs/util";
import {TvcScmWebView} from "./scm/TvcScmWebView";
import {FileChangeEventEmitter} from "./tvc/FileChangeEventEmitter";
import {error} from "./logger";

let websocket: ChannelWebsocket | undefined;
let discussionWebviewManager: DiscussionWebViewManager | undefined;
let httpRoomClient: HttpRoomClient | undefined;

export async function activate(context: vscode.ExtensionContext) {
    console.debug("========= activate =========");
    const meltos = await import("../wasm/index.js");
    const emitter = new FileChangeEventEmitter();
    const tvc = new meltos.WasmTvcClient(emitter);
    const rootFs = new RootFileSystem(tvc.fs(), emitter);
    context.subscriptions.push(
        vscode.workspace.registerFileSystemProvider("meltos", rootFs, {
            isCaseSensitive: true,
        })
    );

    registerOpenRoomCommand(context);
    registerJoinRoomCommand(context);

    const s: SessionConfigsType | undefined =
        context.globalState.get("session");
    if (s) {
        await context.globalState.update("session", undefined);
        await tvc.fs().create_dir_api("/workspace");
        await tvc.unzip(s.user_id);

        const commitHistoryView = new CommitHistoryWebView(s.user_id, tvc);
        const provider = new TvcProvider(
            s.user_id,
            rootFs,
            tvc,
            commitHistoryView
        );
        registerShowHistoryCommand(context, commitHistoryView);
        const sessionConfigs = new meltos.SessionConfigs(
            s.session_id,
            s.room_id,
            s.user_id
        );
        registerScmView(context, sessionConfigs, provider);
        registerDiscussion(context, sessionConfigs, provider, meltos);
        registerClipboardRoomIdCommand(context, sessionConfigs.room_id[0]);

        const objProvider = new ObjFileProvider(tvc);
        vscode.workspace.registerTextDocumentContentProvider(
            "tvc",
            objProvider
        );
    }
}

export async function deactivate() {
    console.debug("deactivate");
    await httpRoomClient?.leave();
    websocket?.dispose();
    discussionWebviewManager?.dispose();
    vscode.workspace.updateWorkspaceFolders(
        0,
        vscode.workspace.workspaceFolders?.length
    );
}

const registerOpenRoomCommand = (context: vscode.ExtensionContext) => {
    context.subscriptions.push(
        vscode.commands.registerCommand("meltos.openRoom", async () => {
            // const workspaceSource = await openWorkspacePathDialog();
            // if (!workspaceSource) {
            //     return;
            // }
            const workspaceSource = "D://user";
            const args = createOwnerArgs(workspaceSource);
            await initFromArgs(context, args);
        })
    );
};

const registerJoinRoomCommand = (context: vscode.ExtensionContext) => {
    context.subscriptions.push(
        vscode.commands.registerCommand("meltos.joinRoom", async () => {
            const userInput = await vscode.window.showInputBox({
                placeHolder: "roomId or roomId@userName",
            });
            if (!userInput) {
                return;
            }

            const args = createUserArgs(userInput);
            await initFromArgs(context, args);
        })
    );
};

const initFromArgs = async (
    context: vscode.ExtensionContext,
    args: UserArgs | OwnerArgs
) => {
   try {
        const meltos = await import("../wasm/index.js");
    const tvc = new meltos.WasmTvcClient();

    let sessionConfigs: SessionConfigs;
    if (isOwner(args)) {
        await copyRealWorkspaceToVirtual(args.workspaceSource, tvc.fs());
        sessionConfigs = await tvc.open_room();
    } else {
        sessionConfigs = await tvc.join_room(args.roomId, args.userId);
    }

    await context.globalState.update("session", {
        room_id: sessionConfigs.room_id[0],
        user_id: sessionConfigs.user_id[0],
        session_id: sessionConfigs.session_id[0],
    });
    const folderCount = vscode.workspace.workspaceFolders?.length || null;

    vscode.workspace.updateWorkspaceFolders(0, folderCount, {
        uri: Uri.parse("meltos:/"),
        name: sessionConfigs!.user_id[0],
    });
   }catch (e) {
       error(e?.toString() || "failed initialize");
       throw e;
   }
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
                await tvc.saveBundle(roomBundle.tvc);
                vscode.window.showInformationMessage("synced room!");
            } catch (e) {
                console.error(e);
                vscode.window.showErrorMessage("failed sync room");
            }
        })
    );
};

export const convertToWasmBundle = async (
    bundle: BundleType
): Promise<Bundle> => {
    const meltos = await import("../wasm/index.js");
    const traces = bundle.traces.map(
        (t) => new meltos.BundleTrace(t.commit_hash, t.obj_hash)
    );
    const objs = bundle.objs.map(
        (o) =>
            new meltos.BundleObject(
                o.hash,
                new Uint8Array(Buffer.from(o.compressed_buf))
            )
    );
    const branches = bundle.branches.map(
        (b) => new meltos.BundleBranch(b.branch_name, b.commits)
    );

    return new meltos.Bundle(traces, objs, branches);
};
