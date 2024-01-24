import vscode from "vscode";
import {TvcFileSystem} from "./TvcFileSystem";
import {BranchFileSystem} from "./BranchFileSystem";

export class BranchesFileSystem implements TvcFileSystem {
    private readonly _branches = new Map<string, BranchFileSystem>();
    constructor() {
        this._branches.set("owner", new BranchFileSystem());
    }

    owner(){
        return this._branches.get("owner")!;
    }

    async stat(path: string): Promise<vscode.FileStat | undefined> {
        return await this.fileSystem(path).stat(path);
    }

    async write_file(path: string, buf: string | Uint8Array): Promise<void> {
        return await this.fileSystem(path).write_file(path, buf);
    }

    async read_dir(dirUri: string) {
        return await this.fileSystem(dirUri).read_dir(dirUri);
    }

    async create_dir(path: string): Promise<void> {
        return await this.fileSystem(path).create_dir(path);
    }

    async read_file(path: string): Promise<Uint8Array | undefined> {
        return await this.fileSystem(path).read_file(path);
    }

    async all_files_in(path: string): Promise<string[]> {
        return await this.fileSystem(path).all_files_in(path);
    }

    async delete(path: string): Promise<void> {
        return await this.fileSystem(path).delete(path);
    }

    private fileSystem(uri: string): TvcFileSystem {
        const [branch, ...schemes] = uri.split("/");
        const fs = this._branches.get(branch);
        if (fs) {
            return fs;
        } else {
            const newFs = new BranchFileSystem();
            this._branches.set(branch, newFs);
            return newFs;
        }
    }

    private isRepositoryUri(uri: string) {
        return uri.startsWith(".meltos") ||
            uri.startsWith("/.meltos") ||
            uri.startsWith("./.meltos");
    }
}