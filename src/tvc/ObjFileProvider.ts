import vscode from "vscode";
import {WasmTvcClient} from "../../wasm";
import path from "path";
import {ChangeMeta} from "meltos_ts_lib/src/scm/changes/ChangeMeta";
import {openDiffCommand} from "../apiWrapper";
import {toMeltosUri} from "../fs/util";

export const openObjDiff = async (changeMeta: ChangeMeta, userId: string) => {
    if (changeMeta.changeType === "delete") {
        await openObjFile(changeMeta.trace_obj_hash!);
    } else {
        await openDiffCommand(
            vscode.Uri.parse(`tvc:/${changeMeta.trace_obj_hash || ""}`),
            toMeltosUri(changeMeta.filePath, userId),
            `diff(tvc ↔ workspace)`
        );
    }
};

export const openObjFile = async (objHash: string) => {
    let doc = await vscode.workspace.openTextDocument(
        vscode.Uri.parse(`tvc:/${objHash}`)
    );
    await vscode.window.showTextDocument(doc, {preview: false});
};

export class ObjFileProvider implements vscode.TextDocumentContentProvider {
    onDidChange?: vscode.Event<vscode.Uri> | undefined;

    constructor(private readonly tvc: WasmTvcClient) {
    }

    async provideTextDocumentContent(
        uri: vscode.Uri,
        token: vscode.CancellationToken
    ) {
        if(uri.path === "/"){
            return "";
        }
        return (await this.tvc.read_file_from_hash(path.basename(uri.path))) || "";
    }

    async open(uri: vscode.Uri) {
        return await this.tvc.read_file_from_hash(path.basename(uri.path));
    }
}
