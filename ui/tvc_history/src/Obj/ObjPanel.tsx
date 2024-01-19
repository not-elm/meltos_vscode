import {FC} from "react";

import {css} from "@emotion/css";

import {VSCodeDivider} from "@vscode/webview-ui-toolkit/react";
import {CommitMeta, ObjMeta} from "meltos_ts_lib/src/scm/commit/CommitMeta";
import {ObjButtons} from "./ViewButton.tsx";
import "./ObjPanel.css";
import {IconButton} from "@mui/material";
import {Close} from "@mui/icons-material";

export const ObjPanel: FC<{
    commit: CommitMeta;
    onClose: () => void;
}> = ({commit, onClose}) => {
    return (
        <div className={"obj-panel"}>
            <Header commit={commit} onClose={onClose}/>
            <ObjItems objs={commit.objs}/>
        </div>
    );
};


const Header: FC<{
    commit: CommitMeta,
    onClose: () => void
}> = ({commit, onClose}) => {
    return (
        <div className={"obj-panel-header"}>
            <h2>{commit.message}</h2>
            <IconButton onClick={onClose}>
                <Close htmlColor={"#fff"}/>
            </IconButton>
        </div>
    )
}

const ObjItems: FC<{
    objs: ObjMeta[];
}> = ({objs}) => {
    return (
        <ul className={"list-style-none obj-panel-content  scrollbar"}>
            {objs.map((obj) => (
                <li key={obj.hash} className={"obj-panel-item"}>
                    <div className={css`
                        display: flex;
                        justify-content: space-between;
                        
                        padding: 3px 10px;
                    `}>
                        <p>{obj.file_path}</p>
                        <ObjButtons meta={obj}/>
                    </div>
                    <VSCodeDivider/>
                </li>
            ))}
        </ul>
    );
};
