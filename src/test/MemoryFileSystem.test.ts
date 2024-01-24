import {MemoryFileSystem} from "../fs/MemoryFileSystem";
import {deepStrictEqual} from "node:assert";


suite('MemoryFileSystem', () => {

    test('write_file: ファイルが読み書きできること', async () => {
        const fs = new MemoryFileSystem();
        await fs.write_file("/owner/hello.txt", "hello");
        const buf = await fs.read_file("/owner/hello.txt");
        deepStrictEqual(Buffer.from(buf!).toString("utf-8"), "hello");
    });

    test('read_dir: ディレクトリ内のファイルパスが読み取れること', async () => {
        const fs = new MemoryFileSystem();
        await fs.write_file("/owner/hello.txt", "hello");
        const entryNames = await fs.read_dir("/owner");
        console.log(fs.toString());
        deepStrictEqual(entryNames, ["/owner/hello.txt"]);
    });

    test('read_dir: 子孫ディレクトリ内のパスが読み取れること', async () => {
        const fs = new MemoryFileSystem();
        await fs.create_dir("/owner");
        await fs.create_dir("/owner/child");
        await fs.write_file("/owner/child/hello1.txt", "hello");
        await fs.write_file("/owner/child/hello2.txt", "hello");
        const entryNames = await fs.read_dir("/owner/child");

        deepStrictEqual(entryNames, ["/owner/child/hello1.txt", "/owner/child/hello2.txt"]);
    });

    test('all_files_in: 子孫ディレクトリ内のパスが読み取れること', async () => {
        const fs = new MemoryFileSystem();
        await fs.create_dir("/owner");
        await fs.create_dir("/owner/child");
        await fs.write_file("/owner/child/hello1.txt", "hello");
        await fs.write_file("/owner/child/hello2.txt", "hello");
        const entryNames = await fs.all_files_in("/owner");

        deepStrictEqual(entryNames, ["/owner/child/hello1.txt", "/owner/child/hello2.txt"]);
    });

    test('all_files_in: 親ディレクトリ直下のファイルパスは読み取られないこと', async () => {
        const fs = new MemoryFileSystem();
        await fs.write_file("/owner/parent1.txt", "hello");
        await fs.write_file("/owner/parent2.txt", "hello");
        await fs.write_file("/owner/child/hello1.txt", "hello");
        await fs.write_file("/owner/child/hello2.txt", "hello");
        const entryNames = await fs.all_files_in("/owner/child");

        deepStrictEqual(entryNames, ["/owner/child/hello1.txt", "/owner/child/hello2.txt"]);
    });

    test('all_files_in: rootディレクトリ内の全ファイルが取得できること。', async () => {
        const fs = new MemoryFileSystem();
        await fs.write_file("/hello1.txt", "hello");
        await fs.write_file("/owner/hello2.txt", "hello");
        await fs.write_file("/owner/hello3.txt", "hello");
        await fs.write_file("/owner/child/hello4.txt", "hello");
        await fs.write_file("/owner/child/hello5.txt", "hello");
        const entryNames = await fs.all_files_in(".");

        deepStrictEqual(entryNames, [
            "/hello1.txt",
            "/owner/hello2.txt",
            "/owner/hello3.txt",
            "/owner/child/hello4.txt",
            "/owner/child/hello5.txt"
        ]);
    });

    test('delete: ファイルが削除できること', async () => {
        const fs = new MemoryFileSystem();
        await fs.write_file("/parent1.txt", "hello");
        await fs.write_file("/owner/parent2.txt", "hello");
        await fs.delete("/parent1.txt");
        await fs.delete("/owner/parent2.txt");

        const entryNames = await fs.all_files_in(".");
        deepStrictEqual(entryNames, []);
    });

    test('delete: ディレクトリが削除できること', async () => {
        const fs = new MemoryFileSystem();

        await fs.write_file("/owner/parent2.txt", "hello");
        await fs.delete("/owner");

        const entryNames = await fs.all_files_in(".");
        deepStrictEqual(entryNames, []);
    });

    test('delete: 子孫も再帰的に削除できること', async () => {
        const fs = new MemoryFileSystem();

        await fs.write_file("/owner/hello.txt", "hello");
        await fs.write_file("/owner/child/hello.txt", "hello");
        await fs.delete("/owner");

        const entryNames = await fs.all_files_in(".");
        deepStrictEqual(entryNames, []);
    });
});
