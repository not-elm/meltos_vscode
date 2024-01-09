import vscode from "vscode";
import * as fs from "fs";
import * as path from "node:path";
import { backslashToSlash } from "./util";

export class VscodeNodeFs implements vscode.FileSystemProvider, vscode.Disposable {
	private readonly _watchers: fs.FSWatcher[] = []

	private _emitter = new vscode.EventEmitter<vscode.FileChangeEvent[]>();
	onDidChangeFile: vscode.Event<vscode.FileChangeEvent[]> = this._emitter.event;

	constructor() {
		const dir = path.join(process.env.APPDATA!, "meltos");
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir);
		}
	}

	watchWorkspace(f: (event: fs.WatchEventType, fileName: string | null) => void){
		const path = this.asPath("workspace");
		const watcher = fs.watch(path, {}, (event, filename) => {
			f(event, filename);
		});
		this._watchers.push(watcher);
	}

	allFilesIn(uri: string): string[] {
		const entryPath = this.asPath(uri);
		if (!fs.existsSync(entryPath)) {
			return [];
		}

		if (fs.statSync(entryPath).isFile()) {		
			return [backslashToSlash(uri)];
		} else {
			const files = [];
			for (const p of fs.readdirSync(entryPath)) {
				files.push(...this.allFilesIn(path.join(uri, p)));
			}
			return files.map(backslashToSlash);
		}
	}

	writeFileApi(uri: string, content: Uint8Array): void {
		try {
			const parent = path.dirname(this.asPath(uri));
			if (!fs.existsSync(parent)) {
				fs.mkdirSync(parent, { recursive: true });
			}
			this.writeFile(this.asUri(uri), content, {
				create: true,
				overwrite: true,
			});
		} catch (e) {
			console.error(e);
		}
	}

	readFileApi(path: string): Uint8Array | null {
		try {
			const uri = this.asUri(path);
			return this.readFile(uri);
		} catch (e) {
			return null;
		}
	}

	createDirApi(path: string) {
		this.createDirectory(this.asUri(path));
	}

	readDirApi(path: string): string[] | null {
		try {
			return this.readDirectory(this.asUri(path)).map(([path, _]) => path);
		} catch (e) {
			return null;
		}
	}

	deleteApi(uri: string) {
		const path = this.asUri(uri);
		this.delete(path, {
			recursive: true,
		});
	}

	clear() {
		fs.rmSync(this.asPath(), {
			recursive: true,
			force: true,
		});
	}

	clearMeltosDirs() {
		fs.rmSync(this.asPath(".meltos"), {
			recursive: true,
			force: true,
		});
		fs.rmSync(this.asPath("workspace"), {
			recursive: true,
			force: true,
		});
	}

	watch(
		uri: vscode.Uri,
		options: {
			readonly recursive: boolean;
			readonly excludes: readonly string[];
		}
	): vscode.Disposable {
		// const watcher = fs.watch(this.asPath(uri), options);
		return new vscode.Disposable(() => {
			// watcher.close();
		});
	}

	async stat(uri: vscode.Uri): Promise<vscode.FileStat> {
		return this._stat(uri);
	}

	private _stat(uri: vscode.Uri): vscode.FileStat;

	private _stat(uri: vscode.Uri): vscode.FileStat | undefined {
		if (!fs.existsSync(this.asPath(uri))) {
			throw vscode.FileSystemError.FileNotFound(uri);
		}
		const entry = fs.statSync(this.asPath(uri));

		return {
			ctime: entry.ctime.getTime(),
			mtime: entry.mtime.getTime(),
			type: entry.isFile() ? vscode.FileType.File : vscode.FileType.Directory,
			size: entry.size,
		};
	}

	readDirectory(uri: vscode.Uri): [string, vscode.FileType][] {
		return fs.readdirSync(this.asPath(uri)).map((p) => {
			const stat = this._stat(vscode.Uri.joinPath(uri, p));
			return [p, stat.type];
		});
	}

	createDirectory(uri: vscode.Uri): void {
		if (fs.existsSync(this.asPath(uri))) {
			return;
		}
		fs.mkdirSync(this.asPath(uri), {
			recursive: true,
		});

		this._emitter.fire([
			{
				type: vscode.FileChangeType.Changed,
				uri: vscode.Uri.joinPath(
					vscode.Uri.parse("meltos:/"),
					path.dirname(uri.fsPath)
				),
			},
			{
				type: vscode.FileChangeType.Created,
				uri,
			},
		]);
	}

	readFile(uri: vscode.Uri): Uint8Array {
		this.throwIfNotExists(uri);
		return fs.readFileSync(this.asPath(uri));
	}

	writeFile(
		uri: vscode.Uri,
		content: Uint8Array,
		options: {
			readonly create: boolean;
			readonly overwrite: boolean;
		}
	): void {
		this.createParentDirIfNeed(this.asPath(uri));
		fs.writeFileSync(this.asPath(uri), content);
		this._emitter.fire([
			{
				type: vscode.FileChangeType.Created,
				uri,
			},
		]);
	}

	delete(uri: vscode.Uri, options: { readonly recursive: boolean }): void {
		const p = this.asPath(uri);
		fs.rmSync(p, {
			force: true,
			...options,
		});
		
		this._emitter.fire([
			{
				type: vscode.FileChangeType.Deleted,
				uri,
			},
		]);
	}

	rename(
		oldUri: vscode.Uri,
		newUri: vscode.Uri,
		_: { readonly overwrite: boolean }
	): void | Thenable<void> {
		this.createRootDirIfNeed();
		fs.renameSync(this.asPath(oldUri), this.asPath(newUri));
		this._emitter.fire([
			{
				type: vscode.FileChangeType.Deleted,
				uri: oldUri,
			},
			{
				type: vscode.FileChangeType.Created,
				uri: newUri,
			},
		]);
	}

	dispose(){
		// this._watchers.forEach(w => w.close());
	}

	private asUri(path: string) {
		const path2 = path.replaceAll("\\", "/");
		const uri = vscode.Uri.parse(path2);
		return uri.with({
			scheme: "meltos",
		});
	}

	private createParentDirIfNeed(uri: string) {
		const parent = path.dirname(uri);
		
		if (!fs.existsSync(parent)) {
			fs.mkdirSync(parent, {
				recursive: true,
			});
		}
	}

	private createRootDirIfNeed() {
		const root = this.asPath();
		if (!fs.existsSync(root)) {
			fs.mkdirSync(root, {
				recursive: true,
			});
		}
	}

	private throwIfNotExists(path: vscode.Uri | string) {
		if (!fs.existsSync(this.asPath(path))) {
			throw vscode.FileSystemError.FileNotFound();
		}
	}

	private asPath(uri: vscode.Uri | string | null = null) {
		let p: string;
		if (!uri) {
			return path.join(process.env.APPDATA!, "meltos");
		}

		if (typeof uri === "string") {
			p = uri;
		} else {
			p = uri.fsPath;
		}
		return path.join(process.env.APPDATA!, "meltos", p);
	}
}
