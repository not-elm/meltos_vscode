import {FC, useContext, useMemo} from "react";
import {TreeItem,} from "@mui/x-tree-view";
import {ChangeMeta} from "meltos_ts_lib/src/scm/changes.ts";
import {ScmContext} from "../client/useScm.ts";
import {ScmItemText} from "./ScmItem.tsx";
import {Add, FileOpen} from "@mui/icons-material";
import "./tree.css";
import {IconButton, Tooltip} from "@mui/material";
import {CodiconIconTemplate} from "./Template.tsx";
import {vscodeApi} from "../client/VscodeApi.ts";

export const Changes: FC = () => {
    const {changes} = useContext(ScmContext);

    return (
        <TreeItem
            key={"changes"}
            nodeId={"changes"}
            label={"changes"}
        >
            <></>
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
            className={"tree-item"}
            nodeId={meta.filePath}
            label={<StageLabel meta={meta}/>}
            endIcon={<ChangeTypeIcon meta={meta}/>}
        />
    )
}

export const ChangeTypeIcon: FC<{
    meta: ChangeMeta
}> = ({meta}) => {
    return (
        <Tooltip title={meta.changeType} arrow>
            <IconButton onClick={() => {
                vscodeApi.showDiff(meta);
            }}>
                <Icon meta={meta}/>
            </IconButton>
        </Tooltip>
    )
}


const Icon: FC<{
    meta: ChangeMeta
}> = ({meta}) => {
    const color = useMemo(() => "#5be314", []);

    switch (meta.changeType) {
        case "create":
            return <CodiconIconTemplate name={"codicon-new-file"} color={color}/>
        case "delete":
            return <CodiconIconTemplate name={"codicon-trash"} color={color}/>
        case "change":
            return <CodiconIconTemplate name={"codicon-edit"} color={color}/>
    }
};

const StageLabel: FC<{
    meta: ChangeMeta
}> = ({meta}) => {
    return (
        <div className={"stage-label"}>
            <ScmItemText meta={meta}/>
            <div className={"scm-buttons"}>
                {meta.changeType !== "delete" && <OpenFileButton filePath={meta.filePath}/>}
                <StageButton meta={meta}/>
            </div>
        </div>
    )
}

const OpenFileButton: FC<{
    filePath: string
}> = ({filePath}) => {
    return (
        <Tooltip title={"open file"}>
            <IconButton>
                <FileOpen
                    fontSize={"small"}
                    htmlColor={"#12b3e3"}
                    onClick={() => {
                        vscodeApi.openFile(filePath)
                    }}>
                </FileOpen>
            </IconButton>
        </Tooltip>
    )
}

const StageButton: FC<{
    meta: ChangeMeta
}> = ({meta}) => {
    const {stage} = useContext(ScmContext);

    return (
        <Tooltip title={"stage"}>
            <IconButton>
                <Add
                    fontSize={"small"}
                    htmlColor={"#12b3e3"}
                    onClick={() => {
                        stage(meta);
                    }}>
                </Add>
            </IconButton>
        </Tooltip>
    )
}
