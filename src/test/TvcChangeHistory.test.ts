// noinspection DuplicatedCode

import { TvcChangeHistory } from "../tvc/TvcChangeHistory";
import { WasmTvcClient } from "../../wasm";
import { MemFS } from "../fs/MemFs";
import * as vscode from "vscode";
import { FileChangeType } from "vscode";
import { deepStrictEqual, strictEqual } from "assert";
import { ChangeMeta } from "meltos_ts_lib/src/scm/changes/ChangeMeta";

suite("TvcChangeHistory", () => {
    test("Changesが1つの要素を持つこと", async () => {
        const memFs = new MemFS("meltos");
        const tvc = new WasmTvcClient(memFs);
        tvc.init_repository();

        const history = new TvcChangeHistory(memFs, tvc);
        memFs.writeFileApi("workspace/hello.txt", Buffer.from("hello"));
        tvc.stage("hello.txt");

        const changes = await history.feed({
            type: FileChangeType.Created,
            uri: vscode.Uri.parse("meltos:/workspace/hello.txt"),
        });

        strictEqual(changes.length, 1);
        deepStrictEqual(changes[0], {
            changeType: "create",
            filePath: "workspace/hello.txt",
            trace_obj_hash: null,
        } as ChangeMeta);
    });

    test("2つファイルが新規作成された際にChangesが2つになること", async () => {
        const memFs = new MemFS("meltos");
        const tvc = new WasmTvcClient(memFs);
        tvc.init_repository();

        const history = new TvcChangeHistory(memFs, tvc);
        memFs.writeFileApi("workspace/hello.txt", Buffer.from("hello"));
        memFs.writeFileApi("workspace/hello2.txt", Buffer.from("hello"));

        await history.feed({
            type: FileChangeType.Created,
            uri: vscode.Uri.parse("meltos:/workspace/hello.txt"),
        });
        const changes = await history.feed({
            type: FileChangeType.Created,
            uri: vscode.Uri.parse("meltos:/workspace/hello2.txt"),
        });

        strictEqual(changes.length, 2);
        deepStrictEqual(changes[0], {
            changeType: "create",
            filePath: "workspace/hello.txt",
            trace_obj_hash: null,
        } as ChangeMeta);
        deepStrictEqual(changes[1], {
            changeType: "create",
            filePath: "workspace/hello2.txt",
            trace_obj_hash: null,
        } as ChangeMeta);
    });

    test("ファイル新規作成後、そのファイルが更新された際にChangesの要素数が変わらないこと", async () => {
        const memFs = new MemFS("meltos");
        const tvc = new WasmTvcClient(memFs);
        tvc.init_repository();
        memFs.writeFileApi("workspace/hello.txt", Buffer.from("hello"));

        const history = new TvcChangeHistory(memFs, tvc);
        await history.feed({
            type: FileChangeType.Created,
            uri: vscode.Uri.parse("meltos:/workspace/hello.txt"),
        });

        memFs.writeFileApi("workspace/hello.txt", Buffer.from("hello2"));
        const changes = await history.feed({
            type: FileChangeType.Changed,
            uri: vscode.Uri.parse("meltos:/workspace/hello.txt"),
        });

        strictEqual(changes.length, 1);
        deepStrictEqual(changes[0], {
            changeType: "create",
            filePath: "workspace/hello.txt",
            trace_obj_hash: null,
        } as ChangeMeta);
    });

    test("Trace内に対象ファイルが存在していない状態からファイルが新規作成され削除された場合、Changesから消えること", async () => {
        const memFs = new MemFS("meltos");
        const tvc = new WasmTvcClient(memFs);
        tvc.init_repository();

        const history = new TvcChangeHistory(memFs, tvc);
        memFs.writeFileApi("workspace/hello.txt", Buffer.from("hello"));
        await history.feed({
            type: FileChangeType.Created,
            uri: vscode.Uri.parse("meltos:/workspace/hello.txt"),
        });

        memFs.deleteApi("workspace/hello.txt");
        const changes = await history.feed({
            type: FileChangeType.Deleted,
            uri: vscode.Uri.parse("meltos:/workspace/hello.txt"),
        });

        strictEqual(changes.length, 0);
    });

    test("Trace内にファイルが存在する場合、ファイルが新規作成され削除された際にChangesにDeleteが追加されること", async () => {
        const memFs = new MemFS("meltos");
        const tvc = new WasmTvcClient(memFs);
        tvc.init_repository();

        memFs.writeFileApi("workspace/hello.txt", Buffer.from("hello"));

        const history = new TvcChangeHistory(memFs, tvc);
        await history.feed({
            type: FileChangeType.Created,
            uri: vscode.Uri.parse("meltos:/workspace/hello.txt"),
        });
        tvc.stage(".");
        tvc.commit("commit");

        memFs.deleteApi("workspace/hello.txt");
        const changes = await history.feed({
            type: FileChangeType.Deleted,
            uri: vscode.Uri.parse("meltos:/workspace/hello.txt"),
        });

        strictEqual(changes.length, 1);
        deepStrictEqual(changes[0], {
            changeType: "delete",
            filePath: "workspace/hello.txt",
            trace_obj_hash:
                tvc.find_obj_hash_from_traces("workspace/hello.txt")?.["0"] ||
                null,
        } as ChangeMeta);
    });

    test("unStageされた際にstagesからchangesへ対象が移動されること", async () => {
        const memFs = new MemFS("meltos");
        const tvc = new WasmTvcClient(memFs);
        tvc.init_repository();

        memFs.writeFileApi("workspace/hello.txt", Buffer.from("hello"));

        const history = new TvcChangeHistory(memFs, tvc);
        await history.feed({
            type: FileChangeType.Created,
            uri: vscode.Uri.parse("meltos:/workspace/hello.txt"),
        });
        tvc.stage(".");
        history.moveToStagesFromChanges("workspace/hello.txt");
        tvc.un_stage("workspace/hello.txt");
        history.moveToChangesFromStages("workspace/hello.txt");

        strictEqual(history.loadStages().length, 0);
        deepStrictEqual(history.loadChanges(), [
            {
                changeType: "create",
                filePath: "workspace/hello.txt",
                trace_obj_hash: null,
            } as ChangeMeta,
        ]);
    });

    test("ファイルが変更されたときにトレース情報と同じハッシュ値ならばchangesから消えること", async () => {
        const memFs = new MemFS("meltos");
        const tvc = new WasmTvcClient(memFs);
        tvc.init_repository();

        memFs.writeFileApi("workspace/hello.txt", Buffer.from("hello"));

        const history = new TvcChangeHistory(memFs, tvc);
        await history.feed({
            type: FileChangeType.Created,
            uri: vscode.Uri.parse("meltos:/workspace/hello.txt"),
        });
        history.moveToStagesFromChanges("workspace/hello.txt");
        tvc.stage(".");
        tvc.commit(".");

        tvc.un_stage("workspace/hello.txt");
        history.moveToChangesFromStages("workspace/hello.txt");

        strictEqual(history.loadStages().length, 0);
        deepStrictEqual(history.loadChanges(), [
            {
                changeType: "create",
                filePath: "workspace/hello.txt",
                trace_obj_hash: null,
            } as ChangeMeta,
        ]);
    });
});
