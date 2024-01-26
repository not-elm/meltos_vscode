import vscode, { FileChangeEvent, FileChangeType } from "vscode";
import { ChangeMeta } from "meltos_ts_lib/src/scm/changes/ChangeMeta";
import { WasmTvcClient } from "../../wasm";
import { TvcFileSystem } from "../fs/TvcFileSystem";

export class TvcChangeHistory {
    constructor(
        private branchName: string,
        private readonly tvc: WasmTvcClient
    ) {}

    async feed(event: vscode.FileChangeEvent): Promise<ChangeMeta[]> {
        const changes = await this.nextChanges(event);
        await this.saveChanges(changes);
        return changes;
    }

    readonly clearStages = async () => {
        await this.saveStages([]);
    };

    readonly moveToStagesFromChanges = async (filePath: string) => {
        let changes = await this.loadChanges();
        const stages: ChangeMeta[] = await this.loadStages();

        for (let file of (await this.tvc.fs().all_files_in_api(filePath))[0]) {
            file = trimStartSlash(file);
            const meta = changes.find((c) => c.filePath === file);
            if (meta) {
                changes = changes.filter((c) => c.filePath !== file);
                stages.push(meta);
            }
        }
        await this.saveStages(distinct(stages));
        await this.saveChanges(changes);
    };

    readonly allMoveToStagesFromChanges = async () => {
        const stages = await this.loadStages();
        const changes = (await this.loadChanges()).filter(
            (m) => !stages.some((c) => c.filePath !== m.filePath)
        );

        await this.saveStages([...stages, ...changes]);
        await this.saveChanges([]);
    };

    readonly moveToChangesFromStages = async (filePath: string) => {
        const changes = await this.loadChanges();
        const stages = await this.loadStages();
        const targetMeta = stages.find((m) => m.filePath === filePath);
        if (targetMeta) {
            await this.saveStages([
                ...stages.filter((m) => m.filePath !== filePath),
            ]);
            await this.saveChanges([
                ...changes.filter((m) => m.filePath !== filePath),
                targetMeta,
            ]);
        }
    };

    readonly allMoveToChangesFromStages = async () => {
        const changes = await this.loadChanges();
        const stages = (await this.loadStages()).filter(
            (m) => !changes.some((c) => c.filePath !== m.filePath)
        );
        await this.saveStages([]);
        await this.saveChanges([...stages, ...changes]);
    };

    readonly loadStages = async (): Promise<ChangeMeta[]> => {
        try {
            const buf = (await this.tvc.fs().read_file_api(".stages"))?.[0];
            return JSON.parse(Buffer.from(buf || []).toString());
        } catch (e) {
            return [];
        }
    };

    readonly loadChanges = async (): Promise<ChangeMeta[]> => {
        try {
            const buf = (await this.tvc.fs().read_file_api(".changes"))?.[0];
            return JSON.parse(Buffer.from(buf || []).toString());
        } catch (e) {
            return [];
        }
    };

    private readonly nextChanges = async (
        event: FileChangeEvent
    ): Promise<ChangeMeta[]> => {
        const filePath = trimStartSlash(event.uri.path);
        const oldChanges = await this.loadChanges();
        const objHash = await this.tvc.find_obj_hash_from_traces(
            this.branchName,
            filePath
        );
        const notExistsInTraces = objHash === undefined;
        const isChange = await this.tvc.is_change(this.branchName, filePath);
        if (!isChange) {
            return [...oldChanges.filter((c) => c.filePath !== filePath)];
        } else if (notExistsInTraces && event.type === FileChangeType.Deleted) {
            return [...oldChanges.filter((c) => c.filePath !== filePath)];
        } else {
            return [
                ...oldChanges.filter((c) => c.filePath !== filePath),
                {
                    changeType: this.fromFileChangeType(
                        event.type,
                        notExistsInTraces
                    ),
                    filePath,
                    trace_obj_hash: objHash?.[0] || null,
                },
            ];
        }
    };

    private readonly saveStages = async (stages: ChangeMeta[]) => {
        await this.tvc
            .fs()
            .write_file_api(".stages", Buffer.from(JSON.stringify(stages)));
    };

    private readonly saveChanges = async (changes: ChangeMeta[]) => {
        await this.tvc
            .fs()
            .write_file_api(".changes", Buffer.from(JSON.stringify(changes)));
    };

    private readonly fromFileChangeType = (
        ty: vscode.FileChangeType,
        notExistsInTraces: boolean
    ) => {
        const changeType = _fromFileChangeType(ty);
        switch (changeType) {
            case "change":
                return notExistsInTraces ? "create" : changeType;
            case "create":
                return notExistsInTraces ? "create" : "change";
            case "delete":
                return "delete";
        }
    };
}

const _fromFileChangeType = (ty: vscode.FileChangeType) => {
    switch (ty) {
        case vscode.FileChangeType.Changed:
            return "change";
        case vscode.FileChangeType.Created:
            return "create";
        case vscode.FileChangeType.Deleted:
            return "delete";
    }
};

const distinct = (metas: ChangeMeta[]) =>
    metas.filter((element, index) => {
        return (
            metas.findIndex((m) => m.filePath === element.filePath) === index
        );
    });

const trimStartSlash = (filePath: string) => filePath;
