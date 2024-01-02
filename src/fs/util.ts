import * as fs from "fs";
import vscode from "vscode";
import * as path from "node:path";

export const parseParentPath = (uri: string, ignoreCount: number = 0) => {
  const ps = backslashToSlash(uri).split("/");
  return 1 < ps.length ? ps.slice(0, ps.length - 1 - ignoreCount).join("/") : "";
};

export const toMeltosUri = (uri: string) => {
  return vscode.Uri.parse(backslashToSlash(uri)).with({
    scheme: "meltos",
  });
};

export const backslashToSlash = (uri: string) => uri.replaceAll("\\", "/");

export const openWorkspacePathDialog = async () => {
  const folderPath = await vscode.window.showOpenDialog({
    title: "select workspace folder",
    canSelectFiles: false,
    canSelectFolders: true,
    canSelectMany: false,
  });

  if (folderPath && 0 < folderPath.length) {
    return folderPath[0];
  } else {
    return undefined;
  }
};

export const copyRealWorkspaceToVirtual = (
  realDirPath: string,
  fileSystem: vscode.FileSystemProvider
) => {
  const virtualRootDir = vscode.Uri.parse("meltos:/workspace");
  fileSystem.createDirectory(virtualRootDir);
  for (const entry of fs.readdirSync(realDirPath)) {
    _copyRealWorkspaceToVirtual(
      realDirPath,
      vscode.Uri.joinPath(virtualRootDir, entry),
      path.join(realDirPath, entry),
      fileSystem
    );
  }
};

const _copyRealWorkspaceToVirtual = (
  rootDirPath: string,
  virtualPath: vscode.Uri,
  realPath: string,
  fileSystem: vscode.FileSystemProvider
) => {
  console.log("realPath = " + realPath);
  if (fs.statSync(realPath).isFile()) {
    const buf = fs.readFileSync(realPath);
    console.log("write = " + realPath);
    fileSystem.writeFile(virtualPath, buf, {
      create: true,
      overwrite: true,
    });
  } else {
    fileSystem.createDirectory(virtualPath);
    for (const entry of fs.readdirSync(realPath)) {
      _copyRealWorkspaceToVirtual(
        rootDirPath,
        virtualPath,
        path.join(realPath, entry),
        fileSystem
      );
    }
  }
};
