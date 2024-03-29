/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as path from "path";
import * as vscode from "vscode";
import { FileType } from "vscode";
import { backslashToSlash, parseParentPath } from "./util";

export class File implements vscode.FileStat {
    type: vscode.FileType;
    ctime: number;
    mtime: number;
    size: number;

    name: string;
    data?: Uint8Array;
    parentDir?: Directory;

    constructor(name: string, parentDir?: Directory) {
        this.type = vscode.FileType.File;
        this.ctime = Date.now();
        this.mtime = Date.now();
        this.size = 0;
        this.name = name;
        this.parentDir = parentDir;
    }

    parent() {
        return this.parentDir;
    }

    toString() {
        return `date = ${this.ctime} data size=${this.size} data = ${this.data}`;
    }
}

export class Directory implements vscode.FileStat {
    type: vscode.FileType;
    ctime: number;
    mtime: number;
    size: number;

    name: string;
    entries: Map<string, File | Directory>;

    constructor(name: string, parent?: Directory) {
        this.type = vscode.FileType.Directory;
        this.ctime = Date.now();
        this.mtime = Date.now();
        this.size = 0;
        this.name = name;
        this.entries = new Map();
        this.entries.set(".", this);
        if (parent) {
            this.entries.set("..", parent);
        }
    }

    readonly readAsDirectory = (dirUri: string): Directory | undefined => {
        const entry = this.read(this.asSchemes(dirUri));
        if (entry) {
            if (entry instanceof Directory) {
                return entry;
            } else {
                throw vscode.FileSystemError.FileIsADirectory(dirUri);
            }
        } else {
            return undefined;
        }
    };

    private asSchemes(uri: string) {
        return ["/", ...uri.split("/")].filter((u) => 0 < u.length);
    }

    readonly read = (
        uriSchemes: string[],
        createOption?: {
            type: vscode.FileType;
        }
    ): Entry | undefined => {
        if (uriSchemes.length <= 0) {
            return undefined;
        }

        const name = uriSchemes[0];

        let entry = this.entries.get(name);
        if (!entry) {
            if (createOption && 1 === uriSchemes.length) {
                entry =
                    createOption.type === vscode.FileType.File
                        ? new File(name, this)
                        : new Directory(name, this);
                this.entries.set(name, entry);
            } else if (createOption && 1 < uriSchemes.length) {
                entry = new Directory(name, this);
                this.entries.set(name, entry);
            } else {
                return undefined;
            }
        }
        if (1 === uriSchemes.length) {
            return entry;
        }
        if (entry instanceof Directory) {
            return entry.read(uriSchemes.splice(1), createOption);
        } else {
            return undefined;
        }
    };

    readonly writeFile = (uriSchemes: string[], buf: Uint8Array) => {
        const entry = this.read(uriSchemes, { type: FileType.File });

        if (!entry) {
            throw vscode.FileSystemError.FileNotFound(uriSchemes.join("/"));
        }
        if (entry instanceof File) {
            entry.data = buf;
        } else {
            throw vscode.FileSystemError.FileIsADirectory(uriSchemes.join("/"));
        }
    };

    allFiles = (): string[] => {
        const ps = [];

        for (const name of this.entries.keys()) {
            if (name === "." || name === "..") {
                continue;
            }
            const entry = this.entries.get(name);
            if (entry instanceof File) {
                ps.push(
                    path.join(this.parentAbsoluteUri() || ".", this.name, name)
                );
            }
            if (entry instanceof Directory) {
                ps.push(...entry.allFiles());
            }
        }
        return ps.map(backslashToSlash);
    };

    parent() {
        const parent = this.entries.get("..");
        if (!parent) {
            return undefined;
        }
        if (parent instanceof Directory) {
            return parent;
        } else {
            throw vscode.FileSystemError.FileNotADirectory(parent.name);
        }
    }

    private parentAbsoluteUri() {
        let parent = this.parent();
        const schemes = [];
        while (parent) {
            schemes.push(parent.name);
            parent = parent.parent();
        }
        return schemes.length === 0 ? null : schemes.reverse().join("/");
    }

    toString(): string {
        return this.allFiles().join("\n");
    }
}

export type Entry = File | Directory;

export class MemFS implements vscode.FileSystemProvider, vscode.Disposable {
    root = new Directory(".");
    // --- manage file metadata
    private _emitter = new vscode.EventEmitter<vscode.FileChangeEvent[]>();
    readonly onDidChangeFile: vscode.Event<vscode.FileChangeEvent[]> =
        this._emitter.event;
    private _bufferedEvents: vscode.FileChangeEvent[] = [];
    private _fireSoonHandle?: NodeJS.Timer;

    constructor(private readonly scheme: string) {}

    stat(uri: vscode.Uri): vscode.FileStat {
        return this._lookup(uri, false);
    }

    allFilesIn(path: string) {
        try {
            if (path === ".") {
                return this.root.allFiles();
            }

            const parent = parseParentPath(path, 1);
            const dir = this._lookupAsDirectory(this.asUri(path), false);

            return dir.allFiles();
        } catch {
            let file = this.readFileApi(path);

            if (file) {
                return [path];
            } else {
                return [];
            }
        }
    }

    readDirApi(uri: string): string[] | undefined {
        try {
            return this.readDirectory(this.asUri(uri)).map(([path, _]) => path);
        } catch (e) {
            return undefined;
        }
    }

    createDirApi(uri: string) {
        this.createDirectory(this.asUri(uri));
    }

    readDirectory(uri: vscode.Uri): [string, vscode.FileType][] {
        const entry = this._lookupAsDirectory(uri, false);
        const result: [string, vscode.FileType][] = [];
        for (const [name, child] of entry.entries) {
            result.push([name, child.type]);
        }
        return result;
    }

    readFileApi(uri: string): Uint8Array | null {
        try {
            const path = this.asUri(uri);
            return this.readFile(path);
        } catch (e) {
            return null;
        }
    }

    deleteApi(uri: string) {
        const path = this.asUri(uri);
        this.delete(path);
    }

    writeFileApi(uri: string, content: Uint8Array | string): void {
        try {
            const buf =
                typeof content === "string"
                    ? new Uint8Array(Buffer.from(content))
                    : new Uint8Array(content);
            this.createParents(this.asUri(uri));
            this.writeFile(this.asUri(uri), buf, {
                create: true,
                overwrite: true,
            });
        } catch (e) {
            console.error(e);
        }
    }

    readFile(uri: vscode.Uri): Uint8Array {
        const data = this._lookupAsFile(uri, false).data;
        if (data) {
            return data;
        }
        throw vscode.FileSystemError.FileNotFound();
    }

    writeFile(
        uri: vscode.Uri,
        content: Uint8Array,
        options: { create: boolean; overwrite: boolean }
    ): void {
        const basename = path.posix.basename(uri.path);
        const dirname = uri.with({ path: path.posix.dirname(uri.path) });

        const parent = this._lookupParentDirectory(uri);
        let entry = parent.entries.get(basename);

        if (entry instanceof Directory) {
            throw vscode.FileSystemError.FileIsADirectory(uri);
        }
        if (!entry && !options.create) {
            throw vscode.FileSystemError.FileNotFound(uri);
        }
        if (entry && options.create && !options.overwrite) {
            throw vscode.FileSystemError.FileExists(uri);
        }
        if (!entry) {
            entry = new File(basename);
            parent.entries.set(basename, entry);
            entry.mtime = Date.now();
            entry.size = content.byteLength;
            entry.data = content;
            this._fireSoon({ type: vscode.FileChangeType.Created, uri });
        } else {
            entry.mtime = Date.now();
            entry.size = content.byteLength;
            entry.data = content;
            this._fireSoon({ type: vscode.FileChangeType.Changed, uri });
        }
    }

    rename(
        oldUri: vscode.Uri,
        newUri: vscode.Uri,
        options: { overwrite: boolean }
    ): void {
        if (!options.overwrite && this._lookup(newUri, true)) {
            throw vscode.FileSystemError.FileExists(newUri);
        }

        const entry = this._lookup(oldUri, false);
        const oldParent = this._lookupParentDirectory(oldUri);

        const newParent = this._lookupParentDirectory(newUri);
        const newName = path.posix.basename(newUri.path);

        oldParent.entries.delete(entry.name);
        entry.name = newName;
        newParent.entries.set(newName, entry);

        this._fireSoon(
            { type: vscode.FileChangeType.Deleted, uri: oldUri },
            { type: vscode.FileChangeType.Created, uri: newUri }
        );
    }

    delete(uri: vscode.Uri): void {
        if (uri.path === "/") {
            this.root = new Directory(".");
            return;
        }

        const dirname = uri.with({ path: path.posix.dirname(uri.path) });
        const basename = path.posix.basename(uri.path);
        const parent = this._lookupAsDirectory(dirname, false);
        if (!parent.entries.has(basename)) {
            throw vscode.FileSystemError.FileNotFound(uri);
        }
        parent.entries.delete(basename);
        parent.mtime = Date.now();
        parent.size -= 1;
        this._fireSoon(
            { type: vscode.FileChangeType.Changed, uri: dirname },
            { uri, type: vscode.FileChangeType.Deleted }
        );
    }

    createDirectory(uri: vscode.Uri): void {
        this.createParents(uri);
        this._createDirectory(uri);
    }

    watch(_resource: vscode.Uri): vscode.Disposable {
        // ignore, fires for all changes...
        return new vscode.Disposable(() => {});
    }

    dispose() {
        this.root = new Directory("");
    }

    private _createDirectory(uri: vscode.Uri) {
        const basename = path.posix.basename(uri.path);
        const dirname = uri.with({ path: path.posix.dirname(uri.path) });
        const parent = this._lookupAsDirectory(dirname, false, true);

        const entry = new Directory(basename);
        parent.entries.set(entry.name, entry);
        parent.mtime = Date.now();
        parent.size += 1;

        return {
            entry,
            events: [
                { type: vscode.FileChangeType.Changed, uri: dirname },
                { type: vscode.FileChangeType.Created, uri },
            ],
        };
    }

    private _lookup(uri: vscode.Uri, silent: false): Entry;

    // --- manage file events

    private _lookup(uri: vscode.Uri, silent: boolean): Entry | undefined;

    private _lookup(uri: vscode.Uri, silent: boolean, create: boolean = false) {
        const parts = uri.path.split("/");
        let entry: Entry = this.root;
        const changeEvents = [];
        const uris = [];
        for (const part of parts) {
            if (!part) {
                continue;
            }
            uris.push(part);
            let child: Entry | undefined;
            if (entry instanceof Directory) {
                child = entry.entries.get(part);
            }
            if (!child) {
                if (create) {
                    const { entry, events } = this._createDirectory(
                        vscode.Uri.parse(uris.join("/"))
                    );
                    child = entry;
                    changeEvents.push(...events);
                } else if (!silent) {
                    throw vscode.FileSystemError.FileNotFound(uri);
                } else {
                    return undefined;
                }
            }
            entry = child;
        }
        this._fireSoon(...changeEvents);
        return entry;
    }

    private createParents(uri: vscode.Uri) {
        try {
            return this._lookupParentDirectory(uri);
        } catch {
            const parts = uri.path.split("/");
            parts.pop();
            let entry: Entry = this.root;
            const uris = [];
            const changeEvents = [];
            for (const part of parts) {
                if (!part) {
                    continue;
                }
                uris.push(part);
                let child: Entry | undefined;
                if (entry instanceof Directory) {
                    child = entry.entries.get(part);
                }
                if (!child) {
                    const { entry, events } = this._createDirectory(
                        vscode.Uri.parse(uris.join("/"))
                    );
                    child = entry;
                    changeEvents.push(...events);
                }
                entry = child;
            }
            return {
                entry,
                events: changeEvents,
            };
        }
    }

    private _lookupAsDirectory(
        uri: vscode.Uri,
        silent: boolean,
        orRoot: boolean = false
    ): Directory {
        const entry = this._lookup(uri, silent);

        if (entry instanceof Directory) {
            return entry;
        }
        if (orRoot) {
            return this.root;
        }
        throw vscode.FileSystemError.FileNotADirectory(uri);
    }

    private _lookupAsFile(uri: vscode.Uri, silent: boolean): File {
        const entry = this._lookup(uri, silent);
        if (entry instanceof File) {
            return entry;
        }
        throw vscode.FileSystemError.FileIsADirectory(uri);
    }

    private _lookupParentDirectory(uri: vscode.Uri): Directory {
        const dirname = uri.with({ path: path.posix.dirname(uri.path) });
        try {
            return this._lookupAsDirectory(dirname, true);
        } catch {
            return this._createDirectory(dirname).entry;
        }
    }

    private _fireSoon(...events: vscode.FileChangeEvent[]): void {
        this._bufferedEvents.push(...events);

        this._emitter.fire(events);
        this._bufferedEvents.length = 0;
    }

    private asUri(path: string): vscode.Uri {
        return vscode.Uri.parse(path).with({
            scheme: "meltos",
        });
    }
}
