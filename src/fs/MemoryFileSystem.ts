import { Directory, File } from "./MemFs";
import vscode from "vscode";
import path from "path";
import { backslashToSlash } from "./util";
import { TvcFileSystem } from "./TvcFileSystem";

export class MemoryFileSystem implements TvcFileSystem {
    private readonly root: Directory = new Directory("");
    constructor() {
        this.root.entries.set("/", new Directory("/"));
    }

    async stat(path: string): Promise<vscode.FileStat | undefined> {
        const entry = this.root.read(this.asSchemes(path));
        if (entry) {
            return {
                ctime: entry.ctime,
                type: entry.type,
                mtime: entry.mtime,
                size: entry.size,
            } as vscode.FileStat;
        } else {
            return undefined;
        }
    }

    async read_file(path: string): Promise<Uint8Array | undefined> {
        const entry = this.root.read(this.asSchemes(path));
        console.debug(
            `MemoryFileSystem::read_file entry: ${entry?.name} uri: ${path}`
        );
        if (!entry) {
            return undefined;
        }
        if (entry instanceof File) {
            return entry.data;
        } else {
            throw vscode.FileSystemError.FileIsADirectory(path);
        }
    }

    async write_file(path: string, buf: Uint8Array | string) {
        this.root.writeFile(this.asSchemes(path), convertToBuf(buf));
    }

    async read_dir(dirUri: string): Promise<string[] | undefined> {
        const entry = this.root.readAsDirectory(dirUri);
        if (entry) {
            return [...entry.entries.keys()]
                .filter((name) => name !== "." && name !== "..")
                .map((name) => backslashToSlash(path.join(dirUri, name)));
        } else {
            return undefined;
        }
    }

    async create_dir(dirUri: string): Promise<void> {
        this.root.read(this.asSchemes(dirUri), {
            type: vscode.FileType.Directory,
        });
    }

    async all_files_in(dirPath: string) {
        const dir = this.root.readAsDirectory(dirPath);
        if (dir) {
            return dir.allFiles();
        } else {
            return [];
        }
    }

    async delete(path: string) {
        const entry = this.root.read(path.split("/"));
        const parent = entry?.parent();
        if (entry && parent) {
            parent.entries.delete(entry.name);
        }
    }

    toString() {
        return `MemoryFileSystem ${JSON.stringify(
            { uris: this.root.allFiles() },
            null,
            2
        )}`;
    }

    private asSchemes(uri: string) {
        return ["/", ...uri.split("/")].filter((u) => 0 < u.length);
    }
}

const convertToBuf = (buf: Uint8Array | string) => {
    if (typeof buf === "string") {
        return new Uint8Array(Buffer.from(buf));
    } else {
        return buf;
    }
};
