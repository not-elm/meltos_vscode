import { WasmTvcClient } from "meltos_wasm";
import vscode, { FileChangeEvent, FileChangeType } from "vscode";
import { RemoveChangeMessage } from "meltos_ts_lib/src/scm/changes/ScmFromWebMessage";
import { ChangeMessage } from "meltos_ts_lib/src/scm/changes/ScmToWebMessage";
import { ChangeMeta } from "meltos_ts_lib/src/scm/changes";
import { json } from "stream/consumers";

export class TvcChangeHistory {
	constructor(
		private readonly fileSystem: vscode.FileSystemProvider,
		private readonly tvc: WasmTvcClient
	) {}

	async inspectChangeStatus(
		event: vscode.FileChangeEvent
	): Promise<ChangeMeta[]> {
        const changes = await this.nextChanges(event);
		this.saveChanges(changes);
		return changes;
	}

	private readonly nextChanges = async (event: FileChangeEvent): Promise<ChangeMeta[]> => {
		const filePath = event.uri.path;
		const oldChanges = await this.loadChanges();
        const p = filePath.startsWith("/") ? 
            filePath.replace("/", "") : 
            filePath;
        
		if (!this.existsInTrace(p) && event.type === FileChangeType.Deleted) {
            return [
				...oldChanges.filter((c) => c.filePath !== event.uri.path),
			];
        } else {
            return [
				...oldChanges.filter((c) => c.filePath !== event.uri.path),
				{
					changeType: fromFileChangeType(event.type),
					filePath: event.uri.path,
				},
			];
		}
	};

	private readonly saveChanges = (changes: ChangeMeta[]) => {
		this.fileSystem.writeFile(
			vscode.Uri.parse(".changes"),
			Buffer.from(JSON.stringify(changes)),
			{
				create: true,
				overwrite: true,
			}
		);
	};

	private readonly existsInTrace = (filePath: string) => {
		return this.tvc.exists_in_traces(filePath);
	};

	private readonly saveChangeStatus = async (
		changes: vscode.FileChangeEvent[],
		event: vscode.FileChangeEvent
	): Promise<ChangeMessage> => {
		// this.context.workspaceState.update("changes", [
		//     ...changes.filter(c => c.uri.path !== event.uri.path),
		//     event
		// ]);

		return {
			type: "change",
			meta: {
				changeType: fromFileChangeType(event.type),
				filePath: event.uri.path,
			},
		};
	};

	readonly loadChanges = async (): Promise<ChangeMeta[]> => {
		// return this.context.workspaceState.get("changes") || []
		try {
			const buf = await this.fileSystem.readFile(vscode.Uri.parse(".changes"));
			const json: ChangeMeta[] = JSON.parse(buf.toString());
			return json;
		} catch (e) {
			return [];
		}
	};
}

const fromFileChangeType = (ty: vscode.FileChangeType) => {
	switch (ty) {
		case vscode.FileChangeType.Changed:
			return "change";
		case vscode.FileChangeType.Created:
			return "create";
		case vscode.FileChangeType.Deleted:
			return "delete";
	}
};
