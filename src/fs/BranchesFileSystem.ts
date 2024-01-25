import vscode from "vscode";
import { TvcFileSystem } from "./TvcFileSystem";
import { BranchFileSystem } from "./BranchFileSystem";

export class BranchesFileSystem implements TvcFileSystem {
    private readonly _branches;
    constructor() {
        this._branches = new Map<string, BranchFileSystem>();
        this._branches.set("owner", new BranchFileSystem());
    }

    owner() {
        return this._branches.get("owner")!;
    }

    async stat(path: string): Promise<vscode.FileStat | undefined> {
        const [fileSystem, schemes] = await this.fileSystem(path);
        return await fileSystem.stat(schemes);
    }

    async write_file(path: string, buf: string | Uint8Array): Promise<void> {
        const [fileSystem, schemes] = this.fileSystem(path);
        return await fileSystem.write_file(schemes, buf);
    }

    async read_dir(dirUri: string) {
        const [fileSystem, schemes] = this.fileSystem(dirUri);
        return await fileSystem.all_files_in(schemes);
    }

    async create_dir(path: string): Promise<void> {
        const [fileSystem, schemes] = this.fileSystem(path);
        return await fileSystem.create_dir(schemes);
    }

    async read_file(path: string): Promise<Uint8Array | undefined> {
        const [fileSystem, schemes] = this.fileSystem(path);
        return await fileSystem.read_file(schemes);
    }

    async all_files_in(path: string): Promise<string[]> {
        const [fileSystem, schemes] = this.fileSystem(path);
        return await fileSystem.all_files_in(schemes);
    }

    async delete(path: string): Promise<void> {
        const [fileSystem, schemes] = this.fileSystem(path);
        return await fileSystem.delete(schemes);
    }

    private fileSystem(uri: string): [TvcFileSystem, string] {
        const [branch, ...schemes] = uri.split("/");
        const fs = this._branches.get(branch);
        if (fs) {
            schemes.forEach((c, i) => {
                console.log(`${i} = ${c}`);
            });
            return [fs, schemes[0] === "" ? "." : schemes.join("/")];
        } else {
            const newFs = new BranchFileSystem();
            this._branches.set(branch, newFs);
            return [newFs, schemes[0] === "" ? "." : schemes.join("/")];
        }
    }
}
