import {renderHook} from "@testing-library/react";
import {act} from "react-dom/test-utils";
import {useChanges} from "./useChanges.ts";
import {ChangeMeta} from "meltos_ts_lib/src/scm/changes.ts";

describe("use scm message", () => {
    test("test", () => {
        const {result} = renderHook(() => useChanges());
        expect(result.current.changes.length).toBe(0);
    })

    test("変更検知された際にChangesにファイルが挿入されること", () => {
        const {result} = renderHook(() => useChanges());
        act(() => {
            result.current.feedChange({
                changeType: "create",
                filePath: "file1"
            });
        });

        expect(result.current.changes.length).toBe(1);
    })


    test("同一ファイルの変更が検知された際に上書きされること", () => {
        const {result} = renderHook(() => useChanges());
        act(() => {
            result.current.feedChange({
                changeType: "create",
                filePath: "file1",
            } as ChangeMeta);
        });
        expect(result.current.changes.length).toBe(1);
        act(() => {
            result.current.feedChange({
                changeType: "change",
                filePath: "file1",
            } as ChangeMeta);
        });
        expect(result.current.changes.length).toBe(1);
    })


    test("2つのファイルの変更が検知された際に変更数が2になること", () => {
        const {result} = renderHook(() => useChanges());
        act(() => {
            result.current.feedChange({
                changeType: "create",
                filePath: "file1",
            });
        });
        expect(result.current.changes.length).toBe(1);
        act(() => {
            result.current.feedChange({
                changeType: "create",
                filePath: "file2",
            });
        });
        expect(result.current.changes.length).toBe(2);
    })


    test("create後、deleteされた際に追加されたファイルが削除されていること", () => {
        const {result} = renderHook(() => useChanges());
        act(() => {
            result.current.feedChange({
                changeType: "create",
                filePath: "file1",
            });
        });
        expect(result.current.changes.length).toBe(1);
        act(() => {
            result.current.feedChange({
                changeType: "delete",
                filePath: "file1",
            });
        });
        expect(result.current.changes.length).toBe(0);
    })
})