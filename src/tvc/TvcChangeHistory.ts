import vscode, {FileChangeEvent, FileChangeType} from "vscode";
import {ChangeMeta} from "meltos_ts_lib/src/scm/changes";
import {VscodeNodeFs} from "../fs/VscodeNodeFs";
import {MemFS} from "../fs/MemFs";
import {WasmTvcClient} from "../../wasm";

export class TvcChangeHistory {
    constructor(
        private readonly fileSystem: VscodeNodeFs | MemFS,
        private readonly tvc: WasmTvcClient
    ) {
    }

    async feed(
        event: vscode.FileChangeEvent
    ): Promise<ChangeMeta[]> {
        const changes = await this.nextChanges(event);
        this.saveChanges(changes);
        return changes;
    }

    readonly clearStages = () => {
        this.saveStages([]);
    };

    readonly moveToStagesFromChanges = (filePath: string) => {
        let changes = this.loadChanges();
        const stages: ChangeMeta[] = this.loadStages();

        for (let file of this.fileSystem.allFilesIn(filePath)) {
            file = trimStartSlash(file);
            const meta = changes.find((c) => c.filePath === file);
            if (meta) {
                changes = changes.filter((c) => c.filePath !== file);
                stages.push(meta);
            }
        }
        this.saveStages(distinct(stages));
        this.saveChanges(changes);
    };

    readonly allMoveToStagesFromChanges = () => {
        const stages = this.loadStages();
        const changes = this
            .loadChanges()
            .filter(m => !stages.some(c => c.filePath !== m.filePath));

        this.saveStages([
            ...stages,
            ...changes
        ]);
        this.saveChanges([]);
    };

    readonly moveToChangesFromStages = (filePath: string) => {
        const changes = this.loadChanges();
        const stages = this.loadStages();
        const targetMeta = stages.find(m => m.filePath === filePath);
        if (targetMeta) {
            this.saveStages([...stages.filter(m => m.filePath !== filePath)]);
            this.saveChanges([
                ...changes.filter(m => m.filePath !== filePath),
                targetMeta
            ]);
        }
    };


    readonly allMoveToChangesFromStages = () => {
        const changes = this.loadChanges();
        const stages = this
            .loadStages()
            .filter(m => !changes.some(c => c.filePath !== m.filePath));
        this.saveStages([]);
        this.saveChanges([
            ...stages,
            ...changes
        ]);
    };

    private readonly nextChanges = async (
        event: FileChangeEvent
    ): Promise<ChangeMeta[]> => {
        const filePath = trimStartSlash(event.uri.path);
        const oldChanges = this.loadChanges();
        const objHash = this.tvc.find_obj_hash_from_traces(filePath);
        const notExistsInTraces = objHash === undefined;

        if (notExistsInTraces && event.type === FileChangeType.Deleted) {
            return [...oldChanges.filter((c) => c.filePath !== filePath)];
        } else {
            return [
                ...oldChanges.filter((c) => c.filePath !== filePath),
                {
                    changeType: this.fromFileChangeType(event.type, notExistsInTraces),
                    filePath,
                    trace_obj_hash: objHash?.[0] || null
                },
            ];
        }
    };

    private readonly saveStages = (stages: ChangeMeta[]) => {
        this.fileSystem.writeFile(
            vscode.Uri.parse(".stages"),
            Buffer.from(JSON.stringify(stages)),
            {
                create: true,
                overwrite: true,
            }
        );
    };

    readonly loadStages = (): ChangeMeta[] => {
        try {
            const buf = this.fileSystem.readFile(vscode.Uri.parse(".stages"));
            return JSON.parse(buf.toString()) || [];
        } catch (e) {
            return [];
        }
    };

    readonly loadChanges = (): ChangeMeta[] => {
        try {
            const buf = this.fileSystem.readFile(vscode.Uri.parse(".changes"));
            return JSON.parse(buf.toString());
        } catch (e) {
            return [];
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
    private readonly fromFileChangeType = (
        ty: vscode.FileChangeType,
        notExistsInTraces: boolean
    ) => {
        const changeType = _fromFileChangeType(ty);
        return changeType === "change" && notExistsInTraces ? "create" : changeType;
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
        return metas.findIndex((m) => m.filePath === element.filePath) == index;
    });

const trimStartSlash = (filePath: string) => filePath.startsWith("/")
    ? filePath.replace("/", "")
    : filePath;