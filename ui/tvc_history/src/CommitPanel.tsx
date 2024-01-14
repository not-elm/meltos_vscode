import {CommitItems} from "./CommitItem.tsx";
import {FC, useState} from "react";
import {CommitMeta} from "meltos_ts_lib/dist/scm/commit/CommitMeta.ts";
import {css} from "@emotion/css";
import {SelectObj} from "./SelectObj.tsx";

export const CommitPanel: FC<{
    commits: CommitMeta[]
}> = ({commits}) => {
    const [selectCommit, $selectCommit] = useState<CommitMeta | null>(null);

    const root = css`
        overflow-y: scroll;
        overflow-x: clip;

        width: 50%;
        display: flex;

        ::-webkit-scrollbar-thumb {
            background: #111111;
        }

        ::-webkit-scrollbar {
            background: #61b2fd;
            scrollbar-color: black transparent;
            width: 8px;
        }
    `

    return (
        <div className={css`
            display: flex;
        `}>
            <div className={root}>
                <CommitItems key={"top"} commits={commits} onSelect={commit => $selectCommit(commit)}/>
            </div>
            <div className={root}>
                {selectCommit && (
                    <SelectObj commit={selectCommit} onClose={() => $selectCommit(null)}/>
                )}
            </div>
        </div>
    )
}