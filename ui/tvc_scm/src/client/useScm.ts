import { useChanges } from "./changes/useChanges.ts";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChangeMeta } from "meltos_ts_lib/src/scm/changes.ts";

import {
	StageMessage,
	UnStageMessage,
} from "meltos_ts_lib/src/scm/changes/ScmFromWebMessage.ts";

export const ScmContext = React.createContext<ScmStore>({
	changes: [],
	stages: [],
	stage: () => {},
	unStage: () => {},
});

export interface ScmStore {
	changes: ChangeMeta[];
	stages: ChangeMeta[];
	stage: (meta: ChangeMeta) => void;
	unStage: (meta: ChangeMeta) => void;
}

export const useScm = (): ScmStore => {
	const { changes, setChanges, feedChange, remove } = useChanges();
	const [stages, $stages] = useState<ChangeMeta[]>([]);
	const stagesRef = useRef<ChangeMeta[]>([]); //  ref オブジェクト作成する
	stagesRef.current = stages; // countを.currentプロパティへ保持する
	const feedChangeRef = useRef<((meta: ChangeMeta) => void )| null>(null);
	feedChangeRef.current = feedChange;
    let vscodeApi = useMemo(() => {
        // @ts-ignore
        return acquireVsCodeApi();
    }, [])
	useEffect(() => {
		const onMessage = (e: MessageEvent) => {
			switch (e.data?.type) {
				case "initial":
					$stages(() => e.data.stages);
					setChanges(() => e.data.changes);
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
					const meta2 = e.data.meta as ChangeMeta;
					$stages(() =>
						stagesRef.current.filter((m) => m.filePath !== meta2.filePath)
					);
					feedChange(meta2);
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

		stage: (meta: ChangeMeta) => {
			vscodeApi.postMessage(
				{
					type: "stage",
					meta,
				} as StageMessage
			);
		},

		unStage: (meta: ChangeMeta) => {
			vscodeApi.postMessage(
				{
					type: "unStage",
					meta,
				} as UnStageMessage
			);
		},
	};
};
