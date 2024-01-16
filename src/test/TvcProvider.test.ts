import { MemFS } from "../fs/MemFs";
import { TvcProvider } from "../tvc/TvcProvider";

import { deepStrictEqual, strictEqual } from "node:assert";
import { sleep } from "./util";
import { InitialMessage } from "meltos_ts_lib/src/scm/changes/ScmToWebMessage";
import { ChangeMeta } from "meltos_ts_lib/src/scm/changes";
import { WasmTvcClient } from "../../wasm";

suite("Tvc File Watcher", async () => {
    test("ワークスペース内のファイルが変更された場合イベントが発火されること", async () => {
        const memFs = new MemFS("meltos");
        const tvc = new WasmTvcClient("owner", memFs);
        const watcher = new TvcProvider(tvc, memFs);
        const messages = [];
        watcher.onUpdateScm((message) => {
            messages.push(message);
        });
        memFs.writeFileApi("workspace/hello.txt", "hello");
        await sleep(100);
        strictEqual(messages.length, 2);
    });

    test("ワークスペース内のファイルが更新された場合イベントが発火されること", async () => {
        const memFs = new MemFS("meltos");
        const tvc = new WasmTvcClient("owner", memFs);
        const watcher = new TvcProvider(tvc, memFs);
        const messages: InitialMessage[] = [];
        watcher.onUpdateScm((message) => {
            messages.push(message);
        });
        memFs.writeFileApi("workspace/hello.txt", "hello");
        memFs.writeFileApi("workspace/hello.txt", "hello world");
        await sleep(100);
        strictEqual(messages.length, 3);

        deepStrictEqual(messages[2], {
            type: "initial",
            changes: [
                {
                    changeType: "change",
                    filePath: "/workspace/hello.txt",
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
        await watcher.stage(".");

        await sleep(100);
        strictEqual(messages.length, 3);
        deepStrictEqual(messages[2].changes, []);
        deepStrictEqual(messages[2].stages, [
            {
                changeType: "change",
                filePath: "/workspace/hello.txt",
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
        await watcher.stage(".");
        await watcher.commit(".");

        await sleep(100);
        strictEqual(messages.length, 4);
        deepStrictEqual(messages[3].changes.length, 0);
        deepStrictEqual(messages[3].stages.length, 0);
    });

    test("Pushできること", async () => {
        const memFs = new MemFS("meltos");
        const tvc = new WasmTvcClient("owner", memFs);
        const sessionConfigs = await tvc.open_room();

        const provider = new TvcProvider(tvc, memFs);

        memFs.writeFileApi("workspace/hello.txt", "hello");
        await sleep(100);
        await provider.stage(".");
        await provider.commit(".");

        await sleep(100);
        await provider.push(sessionConfigs);
    });
});
