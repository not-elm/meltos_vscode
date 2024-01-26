import vscode, { FileChangeType } from "vscode";
import { StatType, WasmFileSystem } from "../../wasm";
import { json } from "stream/consumers";
import { FileChangeEventEmitter } from "../tvc/FileChangeEventEmitter";

export class RootFileSystem implements vscode.FileSystemProvider {
    onDidChangeFile: vscode.Event<vscode.FileChangeEvent[]>;

    constructor(readonly fs: WasmFileSystem, emitter: FileChangeEventEmitter) {
        fs.create_dir_api("/");
        this.onDidChangeFile = emitter.Event;
    }

    watch(
        uri: vscode.Uri,
        options: {
            readonly recursive: boolean;
            readonly excludes: readonly string[];
        }
    ): vscode.Disposable {
        return new vscode.Disposable(() => {});
    }

    async stat(uri: vscode.Uri): Promise<vscode.FileStat> {
        const stat = await this.fs?.stat_api(this.asUri(uri));

        if (stat) {
            return {
                ctime: Number(stat.create_time),
                mtime: Number(stat.update_time),
                type:
                    stat?.ty === 1
                        ? vscode.FileType.Directory
                        : vscode.FileType.File,
                size: Number(stat.size),
            };
        } else {
            throw vscode.FileSystemError.FileNotFound(uri.path);
        }
    }

    async readDirectory(uri: vscode.Uri) {
        const entries =
            (await this.fs?.read_dir_api(this.asUri(uri)))?.["0"] || [];
        const en: [string, vscode.FileType][] = [];
        for (const entry of entries) {
            const stat = await this.fs.stat_api(
                this.asUri(vscode.Uri.joinPath(uri, entry))
            );

            en.push([
                entry,
                stat?.ty === 1
                    ? vscode.FileType.Directory
                    : vscode.FileType.File,
            ]);
        }
        return en;
    }

    async createDirectory(uri: vscode.Uri) {
        const p = this.asUri(uri);
        await this.fs?.create_dir_api(p);
    }

    async readFile(uri: vscode.Uri) {
        const buf = await this.fs?.read_file_api(this.asUri(uri));
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
        await this.fs?.write_file_api(this.asUri(uri), content);
    }

    async delete(uri: vscode.Uri, options: { readonly recursive: boolean }) {
        await this.fs.delete_api(uri.path);
    }

    async rename(
        oldUri: vscode.Uri,
        newUri: vscode.Uri,
        options: { readonly overwrite: boolean }
    ) {
        const jsBuf = await this.fs?.read_file_api(this.asUri(oldUri));
        if (!jsBuf) {
            return;
        }
        const buf = jsBuf[0];
        await this.fs.delete_api(this.asUri(oldUri));
        await this.fs?.write_file_api(this.asUri(newUri), buf);
    }

    asUri(uri: vscode.Uri) {
        return `${uri.path}`;
    }
}
