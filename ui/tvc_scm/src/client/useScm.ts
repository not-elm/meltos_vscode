import {useChanges} from "./changes/useChanges.ts";
import React, {useEffect, useRef, useState} from "react";
import {ChangeMeta} from "meltos_ts_lib/src/scm/changes.ts";

export const ScmContext = React.createContext<ScmStore>({
    changes: [],
    stages: [],
    canPush: false
});

export interface ScmStore {
    changes: ChangeMeta[];
    stages: ChangeMeta[];
    canPush: boolean
}

export const useScm = (): ScmStore => {
    const {changes, setChanges, feedChange, remove} = useChanges();
    const [stages, $stages] = useState<ChangeMeta[]>([]);
    const [canPush, $canPush] = useState(false);
    const stagesRef = useRef<ChangeMeta[]>([]); //  ref オブジェクト作成する
    stagesRef.current = stages; // countを.currentプロパティへ保持する
    const feedChangeRef = useRef<((meta: ChangeMeta) => void) | null>(null);
    feedChangeRef.current = feedChange;

    const canPushRef = useRef($canPush);

    useEffect(() => {
        const onMessage = (e: MessageEvent) => {
            switch (e.data?.type) {
                case "initial":
                    $stages(() => e.data.stages);
                    setChanges(() => e.data.changes);
                    canPushRef.current(e.data.canPush);
                    break;

                case "change":
                    feedChangeRef.current?.(e.data.meta);
                    break;

                case "staged":
                    const meta = e.data.meta as ChangeMeta;
                    remove(meta);
                    $stages(() => [
                        ...stagesRef.current.filter((m) => m.filePath !== meta.filePath),
                        meta,
                    ]);
                    break;
                case "unStaged":
                    console.log(e.data)
                    $stages(() =>
                        stagesRef.current.filter((m) => m.filePath !== e.data.filePath)
                    );
                // feedChange(meta2);
            }
        };

        window.addEventListener("message", onMessage);
        return () => {
            window.removeEventListener("message", onMessage);
        };
    }, []);

    return {
        changes,
        stages,
        canPush
    };
};
