"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("@testing-library/react");
const useScm_ts_1 = require("./useScm.ts");
const test_utils_1 = require("react-dom/test-utils");
const time_ts_1 = require("../time.ts");
describe("use scm", () => {
    const onMessage = (e) => {
        switch (e.data.type) {
            case "stage":
                window.postMessage({
                    type: "staged",
                    meta: e.data.meta
                }, "*");
                break;
            case "unStage":
                window.postMessage({
                    type: "unStaged",
                    meta: e.data.meta
                }, "*");
        }
    };
    beforeEach(() => {
        window.addEventListener("message", onMessage);
    });
    afterEach(() => {
        window.addEventListener("message", onMessage);
    });
    test("ステージされた際にchangesからファイルが消え、Stagesにファイルが追加されること", async () => {
        const { result } = (0, react_1.renderHook)(() => (0, useScm_ts_1.useScm)());
        const meta = {
            changeType: "create",
            filePath: "hello.txt",
        };
        await (0, test_utils_1.act)(async () => {
            window.postMessage({
                type: "change",
                meta
            }, "*");
            result.current.stage(meta);
            await (0, time_ts_1.sleep)(100);
        });
        expect(result.current.changes.length).toBe(0);
        expect(result.current.stages.length).toBe(1);
    });
    test("UnStageされた際にChangesにファイルが戻り、Stagesのファイルが削除されること", async () => {
        const { result } = (0, react_1.renderHook)(() => (0, useScm_ts_1.useScm)());
        const meta = {
            changeType: "create",
            filePath: "hello.txt",
        };
        await (0, test_utils_1.act)(async () => {
            window.postMessage({
                type: "change",
                meta
            }, "*");
            result.current.stage(meta);
            await (0, time_ts_1.sleep)(100);
            result.current.unStage(meta);
            await (0, time_ts_1.sleep)(100);
        });
        expect(result.current.changes.length).toBe(1);
        expect(result.current.stages.length).toBe(0);
    });
});
//# sourceMappingURL=useScm.test.js.map