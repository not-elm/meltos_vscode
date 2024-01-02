import {StorageFs} from "../fs/StorageFs";
import {deepStrictEqual, strictEqual} from "node:assert";
import { MemFS } from "../fs/fileSystemProvider";
import { parseParentPath } from "../fs/util";

suite("StorageFs", () => {
    const fs = new MemFS();
    setup(() => {
        fs.dispose();
    });

    test("ファイルパスがひとつ取得できること", () => {
        fs.writeApi("test", Buffer.from("hello"));
        const files = fs.allPathApi("test");
        deepStrictEqual(files, ["test"]);
    });

    test("ディレクトリ内の2津のファイルが取得できること", () => {

        fs.writeApi("src/test.txt", Buffer.from("test"));
        fs.writeApi("src/hello.txt", Buffer.from("hello"));
        const files = fs.allPathApi("src");
        deepStrictEqual(files.sort(), [
            "src/test.txt",
            "src/hello.txt"
        ].sort());
    });

    test("ディレクトリ内のディレクトリを再帰的に確認されていること", () => {

        fs.writeApi("src/test.txt", Buffer.from("test"));
        fs.writeApi("src/dir/sample1.txt", Buffer.from("hello"));
        fs.writeApi("src/dir/sample2.txt", Buffer.from("hello"));

        const files = fs.allPathApi("src");
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