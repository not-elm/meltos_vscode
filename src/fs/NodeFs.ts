import vscode, {FileChangeType, FileType} from "vscode";
import {NodeFileSystem, StatType} from "meltos_wasm";

export class NodeFs implements vscode.FileSystemProvider{
    private _emitter = new vscode.EventEmitter<vscode.FileChangeEvent[]>();
    onDidChangeFile: vscode.Event<vscode.FileChangeEvent[]> = this._emitter.event;

    constructor(readonly nodeFs: NodeFileSystem) {
    }

    watch(uri: vscode.Uri, options: { readonly recursive: boolean; readonly excludes: readonly string[]; }): vscode.Disposable {
         return new vscode.Disposable(() => {

        });
    }
    stat(uri: vscode.Uri): vscode.FileStat {
        const stat = this.nodeFs.stat_api(uri.path);
        if(stat){
            return {
                size: Number(stat.size),
                ctime: Number(stat.create_time),
                mtime: Number(stat.update_time),
                type: stat.ty === StatType.File ? FileType.File : FileType.Directory
            }
        }else{
             throw vscode.FileSystemError.FileNotFound();
        }
    }
    readDirectory(uri: vscode.Uri): [string, vscode.FileType][] {
        const entries = this.nodeFs.read_dir_api(uri.path) || [];
        return entries
            .map(en => {
                const stat = this.stat(vscode.Uri.parse(en));
                return [en, stat.type]
            })
    }
    createDirectory(uri: vscode.Uri): void | Thenable<void> {
        this.nodeFs.create_dir_api(uri.path);
        this._emitter.fire([{
            type: FileChangeType.Created,
            uri
        }])
    }
    readFile(uri: vscode.Uri): Uint8Array {
        const buf = this.nodeFs.read_file_api(uri.path) ;
        if(buf){
            return buf;
        }else{
            throw vscode.FileSystemError.FileNotFound();
        }
    }
    writeFile(uri: vscode.Uri, content: Uint8Array, options: { readonly create: boolean; readonly overwrite: boolean; }): void | Thenable<void> {
        this.nodeFs.write_file_api(uri.path, content);
        this._emitter.fire([{
            type: FileChangeType.Created,
            uri
        }])
    }
    delete(uri: vscode.Uri, options: { readonly recursive: boolean; }): void | Thenable<void> {
        this.nodeFs.delete_api(uri.path);
        this._emitter.fire([{
            type: FileChangeType.Deleted,
            uri
        }])
    }
    rename(oldUri: vscode.Uri, newUri: vscode.Uri, options: { readonly overwrite: boolean; }): void | Thenable<void> {
        throw new Error("Method not implemented.");
    }
}