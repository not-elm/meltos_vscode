import {deepStrictEqual, strictEqual} from "node:assert";
import {NodeJsFileSystem} from "../fs/NodeJsFileSystem";


suite('NodeJsFileSystem', () => {
    test('NodeJsFileSystem::read_file: ファイルが存在しない場合undefinedが返ること', async () => {
        await withDelete(async fs => {
            await fs.delete(".");
            const buf = await fs.read_file("/owner/hello.txt");
            strictEqual(buf, undefined);
        });
    });

    test('NodeJsFileSystem::read_file: ファイルが存在する場合bufferが返ること', async () => {
        await withDelete(async fs => {
            await fs.write_file("/owner/hello.txt", "hello");
            const buf = await fs.read_file("/owner/hello.txt");
            strictEqual(Buffer.from(buf!).toString("utf-8"), "hello");
        });
    });

    test('NodeJsFileSystem::read_dir: ディレクトリ内のファイルパスが読み取れること', async () => {
        await withDelete(async fs => {
            await fs.write_file("/owner/hello.txt", "hello");

            const entryNames = await fs.read_dir("/owner");
            deepStrictEqual(entryNames, ["/owner/hello.txt"]);
        });
    });

    test('NodeJsFileSystem::read_dir: 子孫ディレクトリ内のパスが読み取れること', async () => {
        await withDelete(async fs => {
            await fs.create_dir("/owner");
            await fs.create_dir("/owner/child");
            await fs.write_file("/owner/child/hello1.txt", "hello");
            await fs.write_file("/owner/child/hello2.txt", "hello");

            const entryNames = await fs.read_dir("/owner/child");
            deepStrictEqual(entryNames, ["/owner/child/hello1.txt", "/owner/child/hello2.txt"]);
        });
    });

    test('NodeJsFileSystem::all_files_in: 子孫ディレクトリ内のパスが読み取れること', async () => {
        await withDelete(async fs => {
            await fs.create_dir("/owner");
            await fs.create_dir("/owner/child");
            await fs.write_file("/owner/child/hello1.txt", "hello");
            await fs.write_file("/owner/child/hello2.txt", "hello");

            const entryNames = await fs.all_files_in("/owner");
            deepStrictEqual(entryNames, ["/owner/child/hello1.txt", "/owner/child/hello2.txt"]);

        });
    });

    test('NodeJsFileSystem::all_files_in: 親ディレクトリ直下のファイルパスは読み取られないこと', async () => {
        await withDelete(async fs => {
            await fs.write_file("/owner/parent1.txt", "hello");
            await fs.write_file("/owner/parent2.txt", "hello");
            await fs.write_file("/owner/child/hello1.txt", "hello");
            await fs.write_file("/owner/child/hello2.txt", "hello");
            const entryNames = await fs.all_files_in("/owner/child");

            deepStrictEqual(entryNames, ["/owner/child/hello1.txt", "/owner/child/hello2.txt"]);
        });
    });

    test('NodeJsFileSystem::all_files_in: rootディレクトリ内の全ファイルが取得できること。', async () => {
        await withDelete(async fs => {
            await fs.write_file("/hello1.txt", "hello");
            await fs.write_file("/owner/hello2.txt", "hello");
            await fs.write_file("/owner/hello3.txt", "hello");
            await fs.write_file("/owner/child/hello4.txt", "hello");
            await fs.write_file("/owner/child/hello5.txt", "hello");
            const entryNames = await fs.all_files_in(".");
            entryNames.sort();
            deepStrictEqual(entryNames, [
                "/hello1.txt",
                "/owner/child/hello4.txt",
                "/owner/child/hello5.txt",
                "/owner/hello2.txt",
                "/owner/hello3.txt",
            ]);
        });
    });

    test('NodeJsFileSystem::delete: ファイルが削除できること', async () => {
        await withDelete(async fs => {
            await fs.write_file("/parent1.txt", "hello");
            await fs.write_file("/owner/parent2.txt", "hello");
            await fs.delete("/parent1.txt");
            await fs.delete("/owner/parent2.txt");

            const entryNames = await fs.all_files_in(".");
            deepStrictEqual(entryNames, []);
        });
    });

    test('NodeJsFileSystem::delete: ディレクトリが削除できること', async () => {
        await withDelete(async fs => {

            await fs.write_file("/owner/parent2.txt", "hello");
            await fs.delete("/owner");

            const entryNames = await fs.all_files_in(".");
            deepStrictEqual(entryNames, []);
        });
    });

    test('NodeJsFileSystem::delete: 子孫も再帰的に削除できること', async () => {
        await withDelete(async fs => {

            await fs.write_file("/owner/hello.txt", "hello");
            await fs.write_file("/owner/child/hello.txt", "hello");
            await fs.delete("/owner");

            const entryNames = await fs.all_files_in(".");
            deepStrictEqual(entryNames, []);
        });
    });
});
const withDelete = async (f: (fs: NodeJsFileSystem) => Promise<void>) => {
    const fs = new NodeJsFileSystem();
    try {
        await f(fs);
    } catch (e) {
        console.error(e);
        throw e;
    } finally {
        await fs.delete(".");
    }
};