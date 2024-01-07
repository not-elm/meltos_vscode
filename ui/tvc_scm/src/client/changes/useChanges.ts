import {useState} from "react";
import {ChangeMeta} from "meltos_ts_lib/src/scm/changes.ts";

export const useChanges = () => {
    const [changes, $changes] = useState<ChangeMeta[]>([])

    return {
        changes,
        feedChange: (meta: ChangeMeta) => {
            const oldMeta = changes.find(m => m.filePath == meta.filePath);
            if (oldMeta && oldMeta.changeType === "create" && meta.changeType === "delete") {
                $changes(metas => [...metas.filter(m => m.filePath != meta.filePath)])
            } else {
                $changes(metas => [
                    ...metas.filter(m => m.filePath != meta.filePath),
                    meta
                ])
            }
        },
        remove: (meta: ChangeMeta) => {
            $changes(metas => metas.filter(m => meta.filePath !== m.filePath))
        }
    }
}




