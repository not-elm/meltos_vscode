import vscode, { FileChangeType } from "vscode";
import {Stat, StatType, WasmFileSystem, WasmTvcClient} from "../../wasm";
import { json } from "stream/consumers";
import { FileChangeEventEmitter } from "../tvc/FileChangeEventEmitter";
import { wasm } from "../wasm";
import { FileChangeObserver } from "../tvc/FileChangeObserver";
import path from "path";
import { NodeJsFileSystem } from "./NodeJsFileSystem";

export class RoomFileSystem implements vscode.FileSystemProvider {
    onDidChangeFile: vscode.Event<vscode.FileChangeEvent[]>;
    private readonly fileSystems: Map<string, WasmTvcClient>;
    constructor(
        observer: FileChangeObserver
    ) {
        this.fileSystems = new Map();
        this.onDidChangeFile = observer.onDidChangeFile;
    }


    async copyWorkspace(branch: string, distDirPath: string){
        const fs = this.fileSystems.get(branch)!.fs();
        const nodeJs = new NodeJsFileSystem();
        for(const fileUri of (await fs.all_files_in_api("workspace"))[0]){
            const buf = await fs.read_file_api(fileUri);
            await nodeJs.write_file(path.join(distDirPath, fileUri), buf![0]);
        }
    }


    get(branch: string){
        return this.fileSystems.get(branch);
    }

    set(branch: string, tvc: WasmTvcClient) {
        this.fileSystems.set(branch, tvc);
    }

    remove(branch: string){
        this.fileSystems.delete(branch);
    }

    watch(
        uri: vscode.Uri,
        options: {
            readonly recursive: boolean;
            readonly excludes: readonly string[];
        }
    ): vscode.Disposable {
        return new vscode.Disposable(() => { });
    }

    async stat(uri: vscode.Uri): Promise<vscode.FileStat> {
        const fs = await this.fs(uri);
        const stat = await fs.stat_api(this.asUri(uri));

        if (stat) {
            return {
                ctime: Number(stat.create_time),
                mtime: Number(stat.update_time),
                type: convertToFileType(stat),
                size: Number(stat.size),
            };
        } else {
            throw vscode.FileSystemError.FileNotFound(uri.path);
        }
    }

    async readDirectory(uri: vscode.Uri) {
        const fs = await this.fs(uri);
        const entries =
            (await fs.read_dir_api(this.asUri(uri)))?.["0"] || [];
        const en: [string, vscode.FileType][] = [];
        for (const entryUri of entries) {
            const stat = await fs.stat_api(entryUri);
            en.push([
                path.basename(entryUri),
                convertToFileType(stat),
            ]);
        }
        return en;
    }

    async createDirectory(uri: vscode.Uri) {
        const fs = await this.fs(uri);
        const p = this.asUri(uri);
        await fs.create_dir_api(p);
    }

    async readFile(uri: vscode.Uri) {
        const fs = await this.fs(uri);
        const buf = await fs.read_file_api(this.asUri(uri));
        if (buf) {
            return buf[0];
        }
        throw vscode.FileSystemError.FileNotFound(uri);
    }

    async writeFile(
        uri: vscode.Uri,
        content: Uint8Array,
        options: {
            readonly create: boolean;
            readonly overwrite: boolean;
        }
    ) {
        const fs = await this.fs(uri);
        await fs.write_file_api(this.asUri(uri), content);
    }

    async delete(uri: vscode.Uri, options: { readonly recursive: boolean }) {
        const fs = await this.fs(uri);
        await fs.delete_api(uri.path);
    }

    async rename(
        oldUri: vscode.Uri,
        newUri: vscode.Uri,
        options: { readonly overwrite: boolean }
    ) {
        const fs = await this.fs(oldUri);

        const jsBuf = await fs.read_file_api(this.asUri(oldUri));
        if (!jsBuf) {
            return;
        }
        const buf = jsBuf[0];

        await fs.delete_api(this.asUri(oldUri));
        await fs.write_file_api(this.asUri(newUri), buf);
    }


    async fs(uri: vscode.Uri) {
        const branch = uri.authority;
        const fs = this.fileSystems.get(branch);
        if (fs) {
            return fs.fs();
        } else {
            const meltos = await wasm;
            const newFs = new meltos.WasmFileSystem();
            const tvc =new meltos.WasmTvcClient(newFs);
            this.fileSystems.set(branch, tvc);
            return newFs;
        }
    }

    asUri(uri: vscode.Uri) {
        const u = uri.path.startsWith("/") ? uri.path.replace("/", "") : uri.path;
        return `${u.length === 0 ? "workspace" : path.join("workspace", u).replaceAll("\\", "/")}`;
    }
}



const convertToFileType = (stat: Stat | undefined) => {
    if (!stat) {
        return vscode.FileType.Unknown;
    }

    switch (stat.ty) {
        case 0:
            return vscode.FileType.File;
        case 1:
            return vscode.FileType.Directory;
        default:
            return vscode.FileType.Unknown;
    }
};