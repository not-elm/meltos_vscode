import {renderHook} from "@testing-library/react";
import {useScm} from "./useScm.ts";
import {ChangeMessage, StagedMessage} from "meltos_ts_lib/src/scm/changes/ScmToWebMessage.ts";
import {ChangeMeta} from "meltos_ts_lib/src/scm/changes.ts";
import {act} from "react-dom/test-utils";
import {sleep} from "../time.ts";

describe("use scm", () => {
    const onMessage = (e: MessageEvent) => {
        switch (e.data.type) {
            case "stage":
                window.postMessage({
                    type: "staged",
                    meta: e.data.meta
                } as StagedMessage, "*");
                break;
            case "unStage":
                window.postMessage({
                    type: "unStaged",
                    meta: e.data.meta
                }, "*")
        }
    }

    beforeEach(() => {
        window.addEventListener("message", onMessage)
    });

    afterEach(() => {
        window.addEventListener("message", onMessage)
    })

    test("ステージされた際にchangesからファイルが消え、Stagesにファイルが追加されること", async () => {
        const {result} = renderHook(() => useScm())
        const meta = {
            changeType: "create",
            filePath: "hello.txt",
        } as ChangeMeta;
        await act(async () => {
            window.postMessage({
                type: "change",
                meta
            } as ChangeMessage, "*")

            result.current.stage(meta);
            await sleep(100);
        });

        expect(result.current.changes.length).toBe(0);
        expect(result.current.stages.length).toBe(1);
    });


    test("UnStageされた際にChangesにファイルが戻り、Stagesのファイルが削除されること", async () => {
        const {result} = renderHook(() => useScm())
        const meta = {
            changeType: "create",
            filePath: "hello.txt",
        } as ChangeMeta;

        await act(async () => {
            window.postMessage({
                type: "change",
                meta
            } as ChangeMessage, "*")

            result.current.stage(meta);
            await sleep(100);
            result.current.unStage(meta);
            await sleep(100);
        });

        expect(result.current.changes.length).toBe(1);
        expect(result.current.stages.length).toBe(0);
    });
});