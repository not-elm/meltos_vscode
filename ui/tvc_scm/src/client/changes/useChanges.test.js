"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("@testing-library/react");
const test_utils_1 = require("react-dom/test-utils");
const useChanges_ts_1 = require("./useChanges.ts");
describe("use scm message", () => {
    test("test", () => {
        const { result } = (0, react_1.renderHook)(() => (0, useChanges_ts_1.useChanges)());
        expect(result.current.changes.length).toBe(0);
    });
    test("変更検知された際にChangesにファイルが挿入されること", () => {
        const { result } = (0, react_1.renderHook)(() => (0, useChanges_ts_1.useChanges)());
        (0, test_utils_1.act)(() => {
            result.current.feedChange({
                changeType: "create",
                filePath: "file1"
            });
        });
        expect(result.current.changes.length).toBe(1);
    });
    test("同一ファイルの変更が検知された際に上書きされること", () => {
        const { result } = (0, react_1.renderHook)(() => (0, useChanges_ts_1.useChanges)());
        (0, test_utils_1.act)(() => {
            result.current.feedChange({
                changeType: "create",
                filePath: "file1",
            });
        });
        expect(result.current.changes.length).toBe(1);
        (0, test_utils_1.act)(() => {
            result.current.feedChange({
                changeType: "change",
                filePath: "file1",
            });
        });
        expect(result.current.changes.length).toBe(1);
    });
    test("2つのファイルの変更が検知された際に変更数が2になること", () => {
        const { result } = (0, react_1.renderHook)(() => (0, useChanges_ts_1.useChanges)());
        (0, test_utils_1.act)(() => {
            result.current.feedChange({
                changeType: "create",
                filePath: "file1",
            });
        });
        expect(result.current.changes.length).toBe(1);
        (0, test_utils_1.act)(() => {
            result.current.feedChange({
                changeType: "create",
                filePath: "file2",
            });
        });
        expect(result.current.changes.length).toBe(2);
    });
    test("create後、deleteされた際に追加されたファイルが削除されていること", () => {
        const { result } = (0, react_1.renderHook)(() => (0, useChanges_ts_1.useChanges)());
        (0, test_utils_1.act)(() => {
            result.current.feedChange({
                changeType: "create",
                filePath: "file1",
            });
        });
        expect(result.current.changes.length).toBe(1);
        (0, test_utils_1.act)(() => {
            result.current.feedChange({
                changeType: "delete",
                filePath: "file1",
            });
        });
        expect(result.current.changes.length).toBe(0);
    });
});
//# sourceMappingURL=useChanges.test.js.map