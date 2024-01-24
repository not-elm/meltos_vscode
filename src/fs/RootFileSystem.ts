import vscode, {FileChangeType} from "vscode";
import {BranchesFileSystem} from "./BranchesFileSystem";

export class RootFileSystem implements vscode.FileSystemProvider {
     readonly fs = new BranchesFileSystem();
    private _emitter = new vscode.EventEmitter<vscode.FileChangeEvent[]>();

    onDidChangeFile: vscode.Event<vscode.FileChangeEvent[]> = this._emitter.event;

    watch(uri: vscode.Uri, options: {
        readonly recursive: boolean;
        readonly excludes: readonly string[];
    }): vscode.Disposable {
        return new vscode.Disposable(() => {

        });
    }

    async stat(uri: vscode.Uri) {
        const stat = await this.fs.stat(uri.path);
        if (stat) {
            return stat;
        } else {
            throw vscode.FileSystemError.FileNotFound(uri.path);
        }
    }

    async readDirectory(uri: vscode.Uri) {
        const entries = (await this.fs.read_dir(uri.path)) || [];
        const en: [string, vscode.FileType][] = [];
        for (const entry of entries) {
            const stat = await this.fs.stat(entry);
            en.push([entry, stat!.type]);
        }
        return en;
    }

    async createDirectory(uri: vscode.Uri) {
        await this.fs.create_dir(uri.path);
        this._emitter.fire([{
            type: FileChangeType.Created,
            uri
        }]);
    }

    async readFile(uri: vscode.Uri) {
        const buf = await this.fs.read_file(uri.path);
        if (buf) {
            return buf;
        }
        throw vscode.FileSystemError.FileNotFound(uri);
    }

    async writeFile(uri: vscode.Uri, content: Uint8Array, options: {
        readonly create: boolean;
        readonly overwrite: boolean;
    }) {
        await this.fs.write_file(uri.path, content);
        this._emitter.fire([{
            type: FileChangeType.Created,
            uri
        }]);
    }

    async delete(uri: vscode.Uri, options: { readonly recursive: boolean; }) {
        await this.fs.delete(uri.path);
    }

    async rename(oldUri: vscode.Uri, newUri: vscode.Uri, options: { readonly overwrite: boolean; }) {
        const buf = await this.fs.read_file(oldUri.path);
        await this.fs.delete(oldUri.path);
        await this.fs.write_file(newUri.path, buf || "");
    }
}