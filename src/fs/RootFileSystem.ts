import vscode, { FileChangeType } from "vscode";
import { BranchesFileSystem } from "./BranchesFileSystem";
import { MemoryFileSystem } from "./MemoryFileSystem";
import { BranchFileSystem } from "./BranchFileSystem";

export class RootFileSystem implements vscode.FileSystemProvider {
    readonly fs = new BranchFileSystem();
    private _emitter = new vscode.EventEmitter<vscode.FileChangeEvent[]>();

    onDidChangeFile: vscode.Event<vscode.FileChangeEvent[]> =
        this._emitter.event;

    watch(
        uri: vscode.Uri,
        options: {
            readonly recursive: boolean;
            readonly excludes: readonly string[];
        }
    ): vscode.Disposable {
        return new vscode.Disposable(() => {});
    }

    async stat(uri: vscode.Uri) {
        const stat = await this.fs.stat(this.asUri(uri));
        if (stat) {
            return stat;
        } else {
            throw vscode.FileSystemError.FileNotFound(uri.path);
        }
    }

    async readDirectory(uri: vscode.Uri) {
        const entries = (await this.fs.read_dir(this.asUri(uri))) || [];
        const en: [string, vscode.FileType][] = [];
        for (const entry of entries.filter((e) => e !== "." && e !== "..")) {
            console.log(`entry = ${entry}`);
            const stat = await this.fs.stat(entry);
            en.push([entry, stat!.type]);
        }
        return en;
    }

    async createDirectory(uri: vscode.Uri) {
        const p = this.asUri(uri);
        if (await this.fs.read_dir(p)) {
            return;
        }
        await this.fs.create_dir(p);
        this._emitter.fire([
            {
                type: FileChangeType.Created,
                uri,
            },
        ]);
    }

    async readFile(uri: vscode.Uri) {
        const buf = await this.fs.read_file(this.asUri(uri));
        if (buf) {
            return buf;
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
        const exists = (await this.fs.read_file(this.asUri(uri))) !== undefined;
        await this.fs.write_file(this.asUri(uri), content);
        this._emitter.fire([
            {
                type: exists ? FileChangeType.Changed : FileChangeType.Created,
                uri,
            },
        ]);
    }

    async delete(uri: vscode.Uri, options: { readonly recursive: boolean }) {
        await this.fs.delete(uri.path);
    }

    async rename(
        oldUri: vscode.Uri,
        newUri: vscode.Uri,
        options: { readonly overwrite: boolean }
    ) {
        const buf = await this.fs.read_file(this.asUri(oldUri));
        await this.fs.delete(this.asUri(oldUri));
        await this.fs.write_file(this.asUri(newUri), buf || "");
    }

    asUri(uri: vscode.Uri) {
        return `${uri.path}`;
    }
}
