import vscode from "vscode";

export interface TvcFileSystem {
    /// エントリのStatを取得します。
    ///
    /// パスが存在しない場合、`None`が返されます。
    stat(path: string): Promise<vscode.FileStat | undefined>;

    /// 対象のパスにファイルを書き込みます。
    ///
    /// ファイルが存在しない場合は新規作成されます。
    /// 親ディレクトリが存在しない場合、親となるディレクトリを全て作成します。
    write_file(path: string, buf: Uint8Array | string): Promise<void>;

    /// ディレクトリを作成します。
    ///
    /// 親ディレクトリが存在しない場合、再帰的に作成します。
    create_dir(path: string): Promise<void>

    read_dir(path: string): Promise<string[] | undefined>


    read_file(path: string): Promise<Uint8Array | undefined>


    all_files_in(path: string): Promise<string[]>;


    delete(path: string): Promise<void>;
}