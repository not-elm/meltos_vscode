import * as vscode from "vscode";
import {
  copyRealWorkspaceToVirtual,
  openWorkspacePathDialog,
  toMeltosUri,
} from "./fs/util";
import { TvnSourceControl } from "./tvn/TvnSourceControl";
import {
  OwnerArgs,
  createOwnerArgs,
  createUserArgs,
  isOwner,
  loadArgs,
} from "./args";
import { MemFS } from "./fs/fileSystemProvider";
import { SessionConfigs } from "meltos_client";
import { Context } from "mocha";

let scm: TvnSourceControl | undefined;

export function activate(context: vscode.ExtensionContext) {
  const fileSystem = new MemFS("meltos");

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
    console.log(`S = ${vscode.workspace.workspaceFolders?.[0].uri}`);
    // fileSystem.clearMeltosDirs();
    const meltosClient = await import("meltos_client");
    const args = loadArgs(context);
    const tvnClient = new meltosClient.TvnClient(args.userId, fileSystem);
    let sessionConfigs: SessionConfigs;
    if (isOwner(args)) {
      copyRealWorkspaceToVirtual(args.workspaceSource, fileSystem);
      sessionConfigs = await tvnClient.open_room(BigInt(60 * 60));
    } else {
      sessionConfigs = await tvnClient.join_room(args.roomId!, args.userId);
    }

    scm = new TvnSourceControl(sessionConfigs, context, tvnClient);
    fileSystem.writeFile(
      toMeltosUri("sessionConfigs"),
      Buffer.from(sessionConfigs.room_id[0]),
      {
        create: true,
        overwrite: true,
      }
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
            forceNewWindow: true
        }
      );
    })
  );
};
