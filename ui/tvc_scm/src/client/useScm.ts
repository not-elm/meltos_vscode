import {useChanges} from "./changes/useChanges.ts";
import React, {useEffect, useRef, useState} from "react";
import {ChangeMeta} from "meltos_ts_lib/src/scm/changes.ts";
import {StageMessage, UnStageMessage} from "meltos_ts_lib/src/scm/changes/ScmFromWebMessage.ts";


export const ScmContext = React.createContext<ScmStore>({
    changes: [],
    stages: [],
    stage: () => {
    },
    unStage: () => {
    }
})


export interface ScmStore {
    changes: ChangeMeta[],
    stages: ChangeMeta[],
    stage: (meta: ChangeMeta) => void,
    unStage: (meta: ChangeMeta) => void
}

export const useScm = (): ScmStore => {
    const {changes, feedChange, remove} = useChanges();
    const [stages, $stages] = useState<ChangeMeta[]>([]);
    const stagesRef = useRef<ChangeMeta[]>([]); //  ref オブジェクト作成する
    stagesRef.current = stages; // countを.currentプロパティへ保持する

    useEffect(() => {
        const onMessage = (e: MessageEvent) => {
            switch (e.data?.type) {
                case "change":
                    feedChange(e.data.meta);
                    break;
                case "staged":
                    const meta = e.data.meta as ChangeMeta;
                    remove(meta);
                    $stages(() => [
                        ...stagesRef.current.filter(m => m.filePath !== meta.filePath),
                        meta
                    ])
                    break;
                case "unStaged":
                    const meta2 = e.data.meta as ChangeMeta;
                    $stages(() => stagesRef.current.filter(m => m.filePath !== meta2.filePath));
                    feedChange(meta2);
            }
        };

        window.addEventListener("message", onMessage);
        return () => {
            window.removeEventListener("message", onMessage)
        }
    }, []);

    return {
        changes,

        stages,

        stage: (meta: ChangeMeta) => {

            window.postMessage({
                type: "stage",
                meta
            } as StageMessage, "*")
        },

        unStage: (meta: ChangeMeta) => {
            window.postMessage({
                type: "unStage",
                meta
            } as UnStageMessage, "*")
        }
    }
}