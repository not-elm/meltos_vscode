import vscode from "vscode";
import {TvcFileSystem} from "./TvcFileSystem";
import {MemoryFileSystem} from "./MemoryFileSystem";
import {NodeJsFileSystem} from "./NodeJsFileSystem";

export class BranchFileSystem implements TvcFileSystem {
    private readonly repository: TvcFileSystem = new NodeJsFileSystem();
    private readonly workspace: TvcFileSystem = new MemoryFileSystem();

    async stat(path: string): Promise<vscode.FileStat | undefined> {
        return await this.fileSystem(path).stat(path);
    }

    async write_file(path: string, buf: string | Uint8Array): Promise<void> {
        return await this.fileSystem(path).write_file(path, buf);
    }

    async read_dir(dirUri: string){
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
        if (this.isRepositoryUri(uri)) {
            return this.repository;
        } else {
            return this.workspace;
        }
    }

    private isRepositoryUri(uri: string) {
        return uri.startsWith(".meltos") ||
            uri.startsWith("/.meltos") ||
            uri.startsWith("./.meltos");
    }
}