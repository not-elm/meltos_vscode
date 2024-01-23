import { MemFS } from "../fs/MemFs";
import { WasmTvcClient } from "../../wasm";
import { ObjFileProvider } from "../tvc/ObjFileProvider";
import vscode from "vscode";
import { deepStrictEqual } from "node:assert";

suite("ObjFileProvider", () => {
    // test("ファイルが読み取れること", () => {
    //     const memFs = new MemFS("meltos");
    //     const tvc = new WasmTvcClient(memFs);
    //     const provider = new ObjFileProvider(tvc);
    //     tvc.init_repository();
    //     memFs.writeFileApi("workspace/hello.txt", "hello");
    //     tvc.stage(".");
    //     tvc.commit("text");
    //     const commits = tvc.all_commit_metas();
    //     const objs = commits.flatMap(c => c.objs);
    //     const buf = provider.open(vscode.Uri.parse(`meltos:/${objs[0].hash}`));
    //     deepStrictEqual(buf, "hello");
    // });
});
