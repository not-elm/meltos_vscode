import vscode from "vscode";
import {WasmTvcClient} from "../../wasm";
import path from "path";
import {ChangeMeta} from "meltos_ts_lib/dist/scm/changes";
import {openDiffCommand} from "../apiWrapper";
import {toMeltosUri} from "../fs/util";


export const openObjDiff = async (changeMeta: ChangeMeta) => {
    if (changeMeta.changeType === "delete") {
        await openObjFile(changeMeta.trace_obj_hash!);
    } else {
        await openDiffCommand(
            vscode.Uri.parse(`tvc:/${changeMeta.trace_obj_hash || ""}`),
            toMeltosUri(changeMeta.filePath),
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

    provideTextDocumentContent(
        uri: vscode.Uri,
        token: vscode.CancellationToken
    ): string {
        return this.tvc.read_file_from_hash(path.basename(uri.path)) || "";
    }

    open(uri: vscode.Uri) {
        return this.tvc.read_file_from_hash(path.basename(uri.path));
    }
}
