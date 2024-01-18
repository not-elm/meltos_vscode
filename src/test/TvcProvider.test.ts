import {MemFS} from "../fs/MemFs";
import {TvcProvider} from "../tvc/TvcProvider";

import {deepStrictEqual, strictEqual} from "node:assert";
import {sleep} from "./util";
import {InitialMessage} from "meltos_ts_lib/src/scm/changes/ScmToWebMessage";
import {ChangeMeta} from "meltos_ts_lib/src/scm/changes";
import {WasmTvcClient} from "../../wasm";

suite("Tvc Provider", async () => {
    test("ワークスペース内のファイルが作成された場合イベントが発火されること", async () => {
        const memFs = new MemFS("meltos");
        const tvc = new WasmTvcClient("owner", memFs);
        const watcher = new TvcProvider(tvc, memFs);
        const messages = [];
        watcher.onUpdateScm((message) => {
            messages.push(message);
        });
        memFs.writeFileApi("workspace/hello.txt", "hello");
        await sleep(100);
        strictEqual(messages.length, 1);
    });

    test("ワークスペース内のファイルが更新された場合イベントが発火されること", async () => {
        const memFs = new MemFS("meltos");
        const tvc = new WasmTvcClient("owner", memFs);
        tvc.init_repository();
        const watcher = new TvcProvider(tvc, memFs);
        const messages: InitialMessage[] = [];
        watcher.onUpdateScm((message) => {
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
                    filePath: "/workspace/hello.txt",
                    trace_obj_hash: null,
                },
            ],
            stages: [],
        } as InitialMessage);
    });

    test("ワークスペース外のファイルが更新されてもイベントは検出されないこと", async () => {
        const memFs = new MemFS("meltos");
        const tvc = new WasmTvcClient("owner", memFs);
        const watcher = new TvcProvider(tvc, memFs);
        const messages: InitialMessage[] = [];
        watcher.onUpdateScm((message) => {
            messages.push(message);
        });

        memFs.writeFileApi("hello.txt", "hello");
        memFs.writeFileApi(".meltos/hello.txt", "hello");
        await sleep(100);
        strictEqual(messages.length, 0);
    });

    test("Stageされた際にイベントが発火されること", async () => {
        const memFs = new MemFS("meltos");
        const tvc = new WasmTvcClient("owner", memFs);
        tvc.init_repository();
        const watcher = new TvcProvider(tvc, memFs);
        const messages: InitialMessage[] = [];
        watcher.onUpdateScm((message) => {
            messages.push(message);
        });
        memFs.writeFileApi("workspace/hello.txt", "hello");
        await sleep(100);
        watcher.stage(".");

        await sleep(100);
        strictEqual(messages.length, 2);
        deepStrictEqual(messages[1].changes, []);
        deepStrictEqual(messages[1].stages, [
            {
                changeType: "create",
                filePath: "/workspace/hello.txt",
                trace_obj_hash: null
            } as ChangeMeta,
        ]);
    });

    test("Commitされた際にStagesが削除されること。", async () => {
        const memFs = new MemFS("meltos");
        const tvc = new WasmTvcClient("owner", memFs);
        tvc.init_repository();
        const watcher = new TvcProvider(tvc, memFs);
        const messages: InitialMessage[] = [];
        watcher.onUpdateScm((message) => {
            messages.push(message);
        });
        memFs.writeFileApi("workspace/hello.txt", "hello");
        await sleep(100);
        watcher.stage(".");
        watcher.commit(".");

        await sleep(100);
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
        await sleep(100);
        provider.stage(".");
        provider.commit(".");

        await sleep(100);
        await provider.push(sessionConfigs);
    });
});
