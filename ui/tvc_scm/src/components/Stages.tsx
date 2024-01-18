import {FC, useContext} from "react";
import {ChangeMeta} from "meltos_ts_lib/src/scm/changes.ts";
import {TreeItem} from "@mui/x-tree-view";
import {ScmContext} from "../client/useScm.ts";
import {ScmItemText} from "./ScmItem.tsx";
import "./Stages.css";
import "./tree.css";
import {ChangeTypeIcon} from "./Changes.tsx";


export const Stages: FC = () => {
    const {stages} = useContext(ScmContext);

    return (
        <TreeItem
            nodeId={"stages"}
            label={"stages"}
            key={"stages"}
            onClick={() => {

            }}
        >
            <></>
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
            className={"tree-item"}
            nodeId={meta.filePath}
            label={<ScmItemText meta={meta}/>}
            endIcon={<ChangeTypeIcon meta={meta} /> }
        />
    )
}