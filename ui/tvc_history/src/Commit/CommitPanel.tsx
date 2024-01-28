import React, {FC, useState} from "react";
import {CommitMeta} from "meltos_ts_lib/src/scm/commit/CommitMeta.ts";
import {CommitItems} from "./CommitItem.tsx";
import "./CommitPanel.css";
import {ObjPanel} from "../Obj/ObjPanel.tsx";
import Split from "@uiw/react-split";

export const CommitPanel: FC<{
    commits: CommitMeta[]
}> = ({commits}) => {
    const [selectCommit, $selectCommit] = useState<CommitMeta | null>(null);

    return (
        <div className={"max-width over-flow-clip"}>
            <div
                className={"commits max-width scrollbar max-height"}>
                <CommitItems
                    commits={commits}
                    onSelect={(commit) => {
                        $selectCommit(commit);
                    }}/>
            </div>
            {selectCommit && (
                <ObjPanelRoot selectCommit={selectCommit} onClose={() => {
                    $selectCommit(null);
                }}/>
            ) || <></>}
        </div>
    )
}


const ObjPanelRoot: FC<{
    selectCommit: CommitMeta,
    onClose: () => void
}> = ({selectCommit, onClose}) => {
    return (
        <Split
            mode={"vertical"}
            className={"commit-panel max-width max-height"}>
            <div style={{height: "50%", visibility: "collapse"}}>
            </div>
            <div className={"bottom-panel  max-width"}>
                <ObjPanel commit={selectCommit} onClose={onClose}/>
            </div>
        </Split>
    )
}