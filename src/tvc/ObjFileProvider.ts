import vscode from "vscode";
import { WasmTvcClient } from "../../wasm";
import path from "path";

export const showObjFile = async (objHash: string) => {
    let doc = await vscode.workspace.openTextDocument(
        vscode.Uri.parse(`tvc:/${objHash}`)
    ); // calls back into the provider
    await vscode.window.showTextDocument(doc, { preview: false });
};

export class ObjFileProvider implements vscode.TextDocumentContentProvider {
    onDidChange?: vscode.Event<vscode.Uri> | undefined;

    constructor(private readonly tvc: WasmTvcClient) {}

    provideTextDocumentContent(
        uri: vscode.Uri,
        token: vscode.CancellationToken
    ): string {
        console.log(`OPEN OBJ FILE ${uri}`);
        const content =  this.tvc.read_file_from_hash(path.basename(uri.path));
        if(content){
            return content
        }else{
            throw vscode.FileSystemError.FileNotFound(uri);
        }
    }

    open(uri: vscode.Uri) {
        return this.tvc.read_file_from_hash(path.basename(uri.path));
    }
}
