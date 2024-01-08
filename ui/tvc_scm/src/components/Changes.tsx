import {FC, useContext} from "react";
import {TreeItem,} from "@mui/x-tree-view";
import {ChangeMeta} from "meltos_ts_lib/src/scm/changes.ts";
import {ScmContext} from "../client/useScm.ts";
import {ScmItemText} from "./ScmItem.tsx";
import {Add} from "@mui/icons-material";
import {css} from "@emotion/css";

export const Changes: FC = () => {
    const {changes} = useContext(ScmContext);

    return (
        <TreeItem
            key={"changes"}
            nodeId={"changes"}
            label={"changes"}
        >
            {changes.map(meta => (
                <ChangeItem
                    meta={meta}
                    key={meta.filePath}
                />
            ))}
        </TreeItem>
    )
}

export const ChangeItem: FC<{
    meta: ChangeMeta
}> = ({meta}) => {

    return (
        <TreeItem
            nodeId={meta.filePath}
            label={<StageLabel meta={meta}/>}
        />
    )
}

const StageLabel: FC<{
    meta: ChangeMeta
}> = ({meta}) => {
    const stageLabel = css`
        display: flex;
        align-items: center;
        gap: 10px;
    `
    return (
        <div className={stageLabel}>
            <ScmItemText meta={meta}/>
            <StageButton meta={meta}/>
        </div>
    )
}

const StageButton: FC<{
    meta: ChangeMeta
}> = ({meta}) => {
    const {stage} = useContext(ScmContext);

    return (
        <Add
            onClick={() => {
                console.log("click stage");
                stage(meta);
            }}>
        </Add>
    )
}
