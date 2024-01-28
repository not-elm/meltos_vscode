import {css} from "@emotion/css";
import {FC} from "react";
import {vscodeApi} from "../VscodeApi.ts";
import {ObjMeta} from "meltos_ts_lib/src/scm/commit/CommitMeta.ts";
import {IconButton, Tooltip} from "@mui/material";
import {Difference, FileOpen} from "@mui/icons-material";
import "./ObjPanelButtons.css";

export const ObjButtons: FC<{
    meta: ObjMeta;
}> = ({meta}) => {

    return (
        <div className={"obj-panel-buttons"}>
            <ShowWorkspaceFileButton meta={meta}/>
            <CompareButton meta={meta}/>
        </div>
    );
};


const ShowWorkspaceFileButton: FC<{
    meta: ObjMeta;
}> = ({meta}) => {
    return (
        <Tooltip title={"show workspace file"}>
            <IconButton
                sx={{padding: 0}}
                onClick={() => {
                    vscodeApi.showFile(meta);
                }}>
                <FileOpen htmlColor={"#4198ff"}/>
            </IconButton>
        </Tooltip>
    );
};

const CompareButton: FC<{
    meta: ObjMeta;
}> = ({meta}) => {
    return (
        <Tooltip title={"diff from workspace"}>
            <IconButton
                sx={{padding: 0}}
                onClick={() => {
                    vscodeApi.showDiffFromWorkspace(meta);
                }}>
                <Difference htmlColor={"#4198ff"}/>
            </IconButton>
        </Tooltip>
    );
};

const ButtonBase: FC<{
    imgSrc: string;
    text: string;
    onClick: () => void;
}> = ({imgSrc, text, onClick}) => {
    const root = css`
        display: flex;
        color: #4198ff;
        gap: 8px;

        :hover {
            cursor: pointer;
        }
    `;

    return (
        <div className={root} onClick={onClick}>
            <img src={imgSrc}/>
            <p>{text}</p>
        </div>
    );
};
