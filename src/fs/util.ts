import * as fs from "fs";
import vscode from "vscode";
import * as path from "node:path";
import {MemFS} from "./MemFs";
import {VscodeNodeFs} from "./VscodeNodeFs";

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
    fileSystem: MemFS | VscodeNodeFs
) => {
    const virtualRootDir = vscode.Uri.parse("meltos:/");

    for (const entry of fs.readdirSync(realDirPath)) {
        _copyRealWorkspaceToVirtual(
            realDirPath,
            vscode.Uri.joinPath(virtualRootDir, "workspace", entry),
            path.join(realDirPath, entry),
            fileSystem
        );
    }
};

const _copyRealWorkspaceToVirtual = (
    rootDirPath: string,
    virtualPath: vscode.Uri,
    realPath: string,
    fileSystem: MemFS | VscodeNodeFs
) => {
    if (fs.statSync(realPath).isFile()) {
        const buf = fs.readFileSync(realPath);
        fileSystem.writeFileApi(virtualPath.path, Uint8Array.from(buf));
    } else {
        fileSystem.createDirApi(virtualPath.path);
        for (const entry of fs.readdirSync(realPath)) {
            _copyRealWorkspaceToVirtual(
                rootDirPath,
                vscode.Uri.joinPath(virtualPath, entry),
                path.join(realPath, entry),
                fileSystem
            );
        }
    }
};
