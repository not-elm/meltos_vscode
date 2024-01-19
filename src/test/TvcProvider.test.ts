// noinspection DuplicatedCode

import {MemFS} from "../fs/MemFs";
import {TvcProvider} from "../tvc/TvcProvider";

import {deepStrictEqual, strictEqual} from "node:assert";
import {sleep} from "./util";
import {InitialMessage} from "meltos_ts_lib/src/scm/changes/ScmToWebMessage";
import {ChangeMeta} from "meltos_ts_lib/src/scm/changes/ChangeMeta";
import {WasmTvcClient} from "../../wasm";

suite("Tvc Provider", async () => {
    test("ワークスペース内のファイルが作成された場合イベントが発火されること", async () => {
        const memFs = new MemFS("meltos");
        const tvc = new WasmTvcClient("owner", memFs);
        const provider = new TvcProvider(tvc, memFs);
        const messages = [];
        provider.onUpdateScm((message) => {
            messages.push(message);
        });
        memFs.writeFileApi("workspace/hello.txt", "hello");
        await sleep(10);
        strictEqual(messages.length, 1);
    });

    test("ワークスペース内のファイルが更新された場合イベントが発火されること", async () => {
        const memFs = new MemFS("meltos");
        const tvc = new WasmTvcClient("owner", memFs);
        tvc.init_repository();
        const provider = new TvcProvider(tvc, memFs);
        const messages: InitialMessage[] = [];
        provider.onUpdateScm((message) => {
            messages.push(message);
        });
        memFs.writeFileApi("workspace/hello.txt", "hello");
        memFs.writeFileApi("workspace/hello.txt", "hello world");
        await sleep(300);
        strictEqual(messages.length, 2);

        deepStrictEqual(messages[1], {
            type: "initial",
            changes: [
                {
                    changeType: "create",
                    filePath: "workspace/hello.txt",
                    trace_obj_hash: null,
                },
            ],
            stages: [],
        } as InitialMessage);
    });

    test("ワークスペース外のファイルが更新されてもイベントは検出されないこと", async () => {
        const memFs = new MemFS("meltos");
        const tvc = new WasmTvcClient("owner", memFs);
        const provider = new TvcProvider(tvc, memFs);
        const messages: InitialMessage[] = [];
        provider.onUpdateScm((message) => {
            messages.push(message);
        });

        memFs.writeFileApi("hello.txt", "hello");
        memFs.writeFileApi(".meltos/hello.txt", "hello");
        await sleep(10);
        strictEqual(messages.length, 0);
    });

    test("Stageされた際にイベントが発火されること", async () => {
        const memFs = new MemFS("meltos");
        const tvc = new WasmTvcClient("owner", memFs);
        tvc.init_repository();
        const provider = new TvcProvider(tvc, memFs);
        const messages: InitialMessage[] = [];
        provider.onUpdateScm((message) => {
            messages.push(message);
        });
        memFs.writeFileApi("workspace/hello.txt", "hello");
        await sleep(10);
        provider.stage(".");

        await sleep(10);
        strictEqual(messages.length, 2);
        deepStrictEqual(messages[1].changes, []);
        deepStrictEqual(messages[1].stages, [
            {
                changeType: "create",
                filePath: "workspace/hello.txt",
                trace_obj_hash: null
            } as ChangeMeta,
        ]);
    });

    test("Commitされた際にStagesが削除されること。", async () => {
        const memFs = new MemFS("meltos");
        const tvc = new WasmTvcClient("owner", memFs);
        tvc.init_repository();
        const provider = new TvcProvider(tvc, memFs);
        const messages: InitialMessage[] = [];
        provider.onUpdateScm((message) => {
            messages.push(message);
        });
        memFs.writeFileApi("workspace/hello.txt", "hello");
        await sleep(10);
        provider.stage(".");
        provider.commit(".");

        await sleep(10);
        strictEqual(messages.length, 3);
        deepStrictEqual(messages[2].changes.length, 0);
        deepStrictEqual(messages[2].stages.length, 0);
    });

    test("Pushできること", async () => {
        const memFs = new MemFS("meltos");
        const tvc = new WasmTvcClient("owner", memFs);
        const sessionConfigs = await tvc.open_room();

        const provider = new TvcProvider(tvc, memFs);

        memFs.writeFileApi("workspace/hello.txt", "hello");
        await sleep(10);
        provider.stage(".");
        provider.commit(".");

        await sleep(10);
        await provider.push(sessionConfigs);
    });


    test("unstageされた際にchangesに対象が移動されること", async () => {
        const memFs = new MemFS("meltos");
        const tvc = new WasmTvcClient("owner", memFs);
        tvc.init_repository();

        const messages: InitialMessage[] = [];
        const provider = new TvcProvider(tvc, memFs);
        provider.onUpdateScm((message) => {
            messages.push(message);
        });

        memFs.writeFileApi("workspace/hello.txt", "hello");
        await sleep(10);
        provider.stage(".");
        provider.unStage("workspace/hello.txt");

        await sleep(10);
        strictEqual(messages.length, 3);
        deepStrictEqual(messages[2], {
            type: "initial",
            stages: [],
            changes: [{
                changeType: "create",
                filePath: "workspace/hello.txt",
                trace_obj_hash: null
            }]
        } as InitialMessage);
    });


    test("unstage後に再びstageできること", async () => {
        const memFs = new MemFS("meltos");
        const tvc = new WasmTvcClient("owner", memFs);
        tvc.init_repository();

        const messages: InitialMessage[] = [];
        const provider = new TvcProvider(tvc, memFs);
        provider.onUpdateScm((message) => {
            messages.push(message);
        });

        memFs.writeFileApi("workspace/hello.txt", "hello");
        await sleep(10);
        provider.stage(".");
        provider.unStage("workspace/hello.txt");
        await sleep(10);
        provider.stage("workspace/hello.txt");
        await sleep(10);
        strictEqual(messages.length, 4);
        deepStrictEqual(messages[3], {
            type: "initial",
            stages: [{
                changeType: "create",
                filePath: "workspace/hello.txt",
                trace_obj_hash: null
            }],
            changes: []
        } as InitialMessage);
    });


    test("既にTracesに存在している状態でdeleteし、再度同名ファイルを作成した際にchangeの状態になること", async () => {
        const memFs = new MemFS("meltos");
        const tvc = new WasmTvcClient("owner", memFs);
        const provider = new TvcProvider(tvc, memFs);
        const messages: InitialMessage[] = [];
        provider.onUpdateScm((message) => {
            messages.push(message);
        });
        memFs.writeFileApi("workspace/hello.txt", Buffer.from("hello"));
        tvc.stage(".");
        tvc.commit("commit text");
        memFs.deleteApi("workspace/hello.txt");

        await sleep(10);
        memFs.writeFileApi("workspace/hello.txt", "");
        await sleep(10);
        const lastMessage = messages[messages.length - 1];
        deepStrictEqual(lastMessage, {
            type: "initial",
            stages: [],
            changes: [{
                changeType: "change",
                filePath: "workspace/hello.txt",
                trace_obj_hash: tvc.find_obj_hash_from_traces("workspace/hello.txt")![0]
            }]
        } as InitialMessage)
    });
});
