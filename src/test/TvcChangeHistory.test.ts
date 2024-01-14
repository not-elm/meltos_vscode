import { TvcChangeHistory } from "../tvc/TvcChangeHistory";
import { WasmTvcClient } from "../../wasm";
import { MemFS } from "../fs/MemFs";
import { FileChangeType, Uri } from "vscode";
import * as vscode from "vscode";
import { deepStrictEqual, strictEqual } from "assert";
import { ChangeMeta } from "meltos_ts_lib/src/scm/changes";

suite("TvcChangeHistory", () => {
    test("Changesが1つの要素を持つこと", async () => {
        const memFs = new MemFS("meltos");
        const tvc = new WasmTvcClient("owner", memFs);

        const history = new TvcChangeHistory(memFs, tvc);
        memFs.writeFileApi("workspace/hello.txt", Buffer.from("hello"));
        tvc.stage("hello.txt");

        const changes = await history.inspectChangeStatus({
            type: FileChangeType.Created,
            uri: vscode.Uri.parse("meltos:/workspace/hello.txt"),
        });

        strictEqual(changes.length, 1);
        deepStrictEqual(changes[0], {
            changeType: "create",
            filePath: "/workspace/hello.txt",
        } as ChangeMeta);
    });

    test("2つファイルが新規作成された際にChangesが2つになること", async () => {
        const memFs = new MemFS("meltos");
        const tvc = new WasmTvcClient("owner", memFs);

        const history = new TvcChangeHistory(memFs, tvc);
        memFs.writeFileApi("workspace/hello.txt", Buffer.from("hello"));
        memFs.writeFileApi("workspace/hello2.txt", Buffer.from("hello"));

        await history.inspectChangeStatus({
            type: FileChangeType.Created,
            uri: vscode.Uri.parse("meltos:/workspace/hello.txt"),
        });
        const changes = await history.inspectChangeStatus({
            type: FileChangeType.Created,
            uri: vscode.Uri.parse("meltos:/workspace/hello2.txt"),
        });

        strictEqual(changes.length, 2);
        deepStrictEqual(changes[0], {
            changeType: "create",
            filePath: "/workspace/hello.txt",
        } as ChangeMeta);
        deepStrictEqual(changes[1], {
            changeType: "create",
            filePath: "/workspace/hello2.txt",
        } as ChangeMeta);
    });

    test("ファイル新規作成後、そのファイルが更新された際にChangesの要素数が変わらないこと", async () => {
        const memFs = new MemFS("meltos");
        const tvc = new WasmTvcClient("owner", memFs);

        const history = new TvcChangeHistory(memFs, tvc);
        await history.inspectChangeStatus({
            type: FileChangeType.Created,
            uri: vscode.Uri.parse("meltos:/workspace/hello.txt"),
        });
        const changes = await history.inspectChangeStatus({
            type: FileChangeType.Changed,
            uri: vscode.Uri.parse("meltos:/workspace/hello.txt"),
        });

        strictEqual(changes.length, 1);
        deepStrictEqual(changes[0], {
            changeType: "change",
            filePath: "/workspace/hello.txt",
        } as ChangeMeta);
    });

    test("Trace内に対象ファイルが存在していない状態からファイルが新規作成され削除された場合、Changesから消えること", async () => {
        const memFs = new MemFS("meltos");
        const tvc = new WasmTvcClient("owner", memFs);

        const history = new TvcChangeHistory(memFs, tvc);
        await history.inspectChangeStatus({
            type: FileChangeType.Created,
            uri: vscode.Uri.parse("meltos:/workspace/hello.txt"),
        });
        const changes = await history.inspectChangeStatus({
            type: FileChangeType.Deleted,
            uri: vscode.Uri.parse("meltos:/workspace/hello.txt"),
        });

        strictEqual(changes.length, 0);
    });

    test("Trace内にファイルが存在する場合、ファイルが新規作成され削除された際にChangesにDeleteが追加されること", async () => {
        const memFs = new MemFS("meltos");
        const tvc = new WasmTvcClient("owner", memFs);
        memFs.writeFileApi("workspace/hello.txt", Buffer.from("hello"));
        console.log(memFs.allFilesIn("."));
        tvc.stage(".");
        tvc.commit("commit");

        const history = new TvcChangeHistory(memFs, tvc);
        await history.inspectChangeStatus({
            type: FileChangeType.Created,
            uri: vscode.Uri.parse("meltos:/workspace/hello.txt"),
        });
        const changes = await history.inspectChangeStatus({
            type: FileChangeType.Deleted,
            uri: vscode.Uri.parse("meltos:/workspace/hello.txt"),
        });

        strictEqual(changes.length, 1);
        deepStrictEqual(changes[0], {
            changeType: "delete",
            filePath: "/workspace/hello.txt",
        } as ChangeMeta);
    });
});
