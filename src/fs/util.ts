import * as fs from "fs";
import vscode from "vscode";
import * as path from "node:path";
import {MemFS} from "./MemFs";
import {VscodeNodeFs} from "./VscodeNodeFs";
import {WasmFileSystem} from "../../wasm";

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

export const copyRealWorkspaceToVirtual = async (
    realDirPath: string,
    fileSystem: WasmFileSystem
) => {
    const virtualRootDir = vscode.Uri.parse("meltos:/");

    for (const entry of fs.readdirSync(realDirPath)) {
        await _copyRealWorkspaceToVirtual(
            realDirPath,
            vscode.Uri.joinPath(virtualRootDir, "workspace", entry),
            path.join(realDirPath, entry),
            fileSystem
        );
    }
};

const _copyRealWorkspaceToVirtual = async (
    rootDirPath: string,
    virtualPath: vscode.Uri,
    realPath: string,
    fileSystem: WasmFileSystem
) => {
    if (fs.statSync(realPath).isFile()) {
        const buf = fs.readFileSync(realPath);
        await fileSystem.write_file_api(virtualPath.path, Uint8Array.from(buf));
    } else {
        await fileSystem.create_dir_api(virtualPath.path);
        for (const entry of fs.readdirSync(realPath)) {
            await _copyRealWorkspaceToVirtual(
                rootDirPath,
                vscode.Uri.joinPath(virtualPath, entry),
                path.join(realPath, entry),
                fileSystem
            );
        }
    }
};
