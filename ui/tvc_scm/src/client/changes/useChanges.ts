import {useState} from "react";
import {ChangeMeta} from "meltos_ts_lib/src/scm/changes.ts";

export const useChanges = () => {
    const [changes, $changes] = useState<ChangeMeta[]>([])

    return {
        changes,
        setChanges: $changes,
        feedChange: (meta: ChangeMeta) => {
            $changes(metas => [
                ...metas.filter(m => m.filePath != meta.filePath),
                meta
            ])
        },
        remove: (meta: ChangeMeta) => {
            $changes(metas => metas.filter(m => meta.filePath !== m.filePath))
        }
    }
}
