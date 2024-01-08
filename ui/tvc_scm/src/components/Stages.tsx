import {FC, useContext} from "react";
import {ChangeMeta} from "meltos_ts_lib/src/scm/changes.ts";
import {TreeItem} from "@mui/x-tree-view";
import {ScmContext} from "../client/useScm.ts";
import {ScmItemText} from "./ScmItem.tsx";
import "./Stages.css"

export const Stages: FC = () => {
    const {stages} = useContext(ScmContext);

    return (
        <TreeItem
            nodeId={"stages"}
            label={"stages"}
            key={"stages"}
        >
            {stages.map(meta => (
                <StageItem
                    meta={meta}
                    key={meta.filePath}
                />
            ))}
        </TreeItem>
    )
}

export const StageItem: FC<{
    meta: ChangeMeta
}> = ({meta}) => {
    return (
        <TreeItem
            nodeId={meta.filePath}
            label={<ScmItemText meta={meta}/>}
        />
    )
}