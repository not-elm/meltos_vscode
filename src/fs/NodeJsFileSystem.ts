import * as fs from "fs";
import * as path from "node:path";
import { backslashToSlash } from "./util";
import { TvcFileSystem } from "./TvcFileSystem";
import vscode, { FileStat } from "vscode";

export class NodeJsFileSystem implements TvcFileSystem {
    stat(path: string): Promise<FileStat | undefined> {
        throw new Error("Method not implemented.");
    }

    async write_file(fileUri: string, buf: Uint8Array | string): Promise<void> {
        await this.create_dir(path.posix.dirname(fileUri));
        const write = () =>
            new Promise<void>((resolve, reject) => {
                fs.writeFile(
                    this.asPath(fileUri),
                    buf,
                    {
                        encoding: "utf-8",
                    },
                    (e) => {
                        if (e) {
                            reject(e);
                        } else {
                            resolve();
                        }
                    }
                );
            });
        await write();
    }

    create_dir(dirUri: string): Promise<void> {
        const uri = this.asPath(dirUri);
        if (fs.existsSync(uri)) {
            return Promise.resolve();
        }
        return new Promise<void>((resolve, reject) => {
            fs.mkdir(uri, { recursive: true }, (e) => {
                if (e) {
                    reject(e);
                } else {
                    resolve();
                }
            });
        });
    }

    delete(path: string): Promise<void> {
        const uri = this.asPath(path);
        if (!fs.existsSync(uri)) {
            return Promise.resolve();
        }

        return new Promise<void>((resolve, reject) => {
            fs.rm(
                uri,
                {
                    force: true,
                    recursive: true,
                },
                (e) => {
                    if (e) {
                        reject(e);
                    } else {
                        resolve();
                    }
                }
            );
        });
    }

    read_file(fileUri: string): Promise<Uint8Array | undefined> {
        const uri = this.asPath(fileUri);
        if (!fs.existsSync(uri)) {
            return Promise.resolve(undefined);
        }
        return new Promise<Uint8Array | undefined>((resolve, reject) => {
            fs.readFile(uri, (e, buf) => {
                if (e) {
                    reject(e);
                } else {
                    resolve(new Uint8Array(buf));
                }
            });
        });
    }

    async all_files_in(uri: string): Promise<string[]> {
        const u = this.asPath(uri);
        if (!fs.existsSync(u)) {
            return [];
        }

        if (fs.statSync(u).isFile()) {
            return [backslashToSlash(uri)];
        } else {
            const files = [];
            const entries = await this.read_dir(uri);
            for (const p of entries || []) {
                const childFiles = await this.all_files_in(p);
                files.push(...childFiles);
            }
            return files;
        }
    }

    read_dir(dirUri: string): Promise<string[] | undefined> {
        const uri = this.asPath(dirUri);
        if (!fs.existsSync(uri)) {
            return Promise.resolve(undefined);
        }
        return new Promise((resolve, reject) => {
            fs.readdir(uri, (e, entries) => {
                if (e) {
                    reject(e);
                } else {
                    resolve(
                        entries
                            .filter((e) => e !== "." && e !== "..")
                            .map((e) => path.join(dirUri, e))
                            .map(backslashToSlash)
                            .map((uri) =>
                                uri.startsWith("/") ? uri : `/${uri}`
                            )
                    );
                }
            });
        });
    }

    private asPath(uri: vscode.Uri | string) {
        let p: string;
        
        if (typeof uri === "string") {
            p = uri;
        } else {
            p = uri.fsPath;
        }
        return p;
    }
}
