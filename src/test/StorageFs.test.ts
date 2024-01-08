
import {deepStrictEqual, strictEqual} from "node:assert";
import { MemFS } from "../fs/MemFs";
import { parseParentPath } from "../fs/util";

suite("StorageFs", () => {
    const fs = new MemFS("meltos");
    setup(() => {
        fs.dispose();
    });

    test("ファイルパスがひとつ取得できること", () => {
        fs.writeFileApi("test", Buffer.from("hello"));
        const files = fs.allFilesIn("test");
        deepStrictEqual(files, ["test"]);
    });

    test("ディレクトリ内の2津のファイルが取得できること", () => {

        fs.writeFileApi("src/test.txt", Buffer.from("test"));
        fs.writeFileApi("src/hello.txt", Buffer.from("hello"));
        const files = fs.allFilesIn("src");
        deepStrictEqual(files.sort(), [
            "src/test.txt",
            "src/hello.txt"
        ].sort());
    });

    test("ディレクトリ内のディレクトリを再帰的に確認されていること", () => {

        fs.writeFileApi("src/test.txt", Buffer.from("test"));
        fs.writeFileApi("src/dir/sample1.txt", Buffer.from("hello"));
        fs.writeFileApi("src/dir/sample2.txt", Buffer.from("hello"));

        const files = fs.allFilesIn("src");
        deepStrictEqual(files.sort(), [
            "src/test.txt",
            "src/dir/sample1.txt",
            "src/dir/sample2.txt"
        ].sort());
    });

    test("親ディレクトリのURIが取得できること", () => {
        const uri = ".meltos/traces/0dajodad";
        const parent = parseParentPath(uri);
        strictEqual(parent, ".meltos/traces");
    });
});