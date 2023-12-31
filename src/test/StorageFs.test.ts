import {StorageFs} from "../fs/StorageFs";
import {deepStrictEqual} from "node:assert";

suite("StorageFs", () => {
    const fs = new StorageFs();
    setup(() => {
        fs.clear();
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
});