import {FC, useContext} from "react";
import {ChangeMeta} from "meltos_ts_lib/src/scm/changes.ts";
import {TreeItem} from "@mui/x-tree-view";
import {ScmContext} from "../client/useScm.ts";
import {ScmItemText} from "./ScmItem.tsx";
import "./Stages.css";
import "./tree.css";
import {ChangeTypeIcon, OpenFileButton} from "./Changes.tsx";
import {IconButton, Tooltip} from "@mui/material";
import {Remove} from "@mui/icons-material";
import {vscodeApi} from "../client/VscodeApi.ts";
import {iconButtonColor} from "./color.ts";


export const Stages: FC = () => {
    const {stages} = useContext(ScmContext);

    return (
        <TreeItem
            nodeId={"stages"}
            label={<StagesLabel showUnstageButton={0 < stages.length}/>}
            key={"stages"}
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


const StagesLabel: FC<{
    showUnstageButton: boolean
}> = ({showUnstageButton}) => {
    return (
        <div className={"stage-label"}>
            <p>stages</p>
            {showUnstageButton && <UnStageButton/>}
        </div>
    )
}

export const StageItem: FC<{
    meta: ChangeMeta
}> = ({meta}) => {
    return (
        <TreeItem
            className={"tree-item"}
            nodeId={meta.filePath}
            label={<StageItemLabel meta={meta}/>}
            endIcon={<ChangeTypeIcon meta={meta}/>}
        />
    )
}


const StageItemLabel: FC<{
    meta: ChangeMeta
}> = ({meta}) => {
    return (
        <div className={"stage-label"} onClick={() => {
            vscodeApi.showDiff(meta);
        }}>
            <ScmItemText meta={meta}/>
            <div className={"scm-buttons"} onClick={e => {
                e.stopPropagation()
            }}>
                <OpenFileButton filePath={meta.filePath}/>
                <UnStageButton filePath={meta.filePath}/>
            </div>
        </div>
    )
}


const UnStageButton: FC<{
    filePath?: string
}> = ({filePath}) => {
    return (
        <Tooltip
            title={filePath === undefined ? "unstage all" : "unstage"}
            className={"un-stage-button"}>
            <IconButton
                sx={{padding: 0}}
                onClick={() => {
                    vscodeApi.unStage(filePath)
                }}>
                <Remove htmlColor={iconButtonColor}/>
            </IconButton>
        </Tooltip>
    )
}