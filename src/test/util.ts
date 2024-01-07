import * as fs from "fs";
import vscode from "vscode";
import * as path from "node:path";

export const openWorkspacePathDialog = async () => {
    const folderPath = await vscode.window.showOpenDialog({
        title: "select workspace folder",
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false
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
    for (const entry of fs.readdirSync(realDirPath)) {
        _copyRealWorkspaceToVirtual(
            realDirPath,
            vscode.Uri.parse("meltos:/"),
            entry,
            fileSystem
        );
    }
};

const _copyRealWorkspaceToVirtual = (
    rootDirPath: string,
    virtualUri: vscode.Uri,
    entry: string,
    fileSystem: vscode.FileSystemProvider
) => {
    const virtualPath = vscode.Uri.joinPath(virtualUri, entry);
    const realPath = path.join(rootDirPath, virtualPath.fsPath);

    if (fs.statSync(realPath).isFile()) {
        const buf = fs.readFileSync(realPath);
       
        fileSystem.writeFile(virtualPath, buf, {
            create: true,
            overwrite: true
        });

    } else {
        fileSystem.createDirectory(virtualPath);
        for (const entry of fs.readdirSync(realPath)) {
            _copyRealWorkspaceToVirtual(rootDirPath, virtualPath, entry, fileSystem);
        }
    }
}