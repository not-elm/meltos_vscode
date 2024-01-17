import {FC} from "react";

import {css} from "@emotion/css";

import {VSCodeDivider} from "@vscode/webview-ui-toolkit/react";
import {CommitMeta, ObjMeta} from "meltos_ts_lib/dist/scm/commit/CommitMeta";
import {ObjButtons} from "./ViewButton.tsx";
import "./ObjPanel.css";
import {CodiconIconTemplate} from "../codicons/Template.tsx";

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
            <CodiconIconTemplate name={"codicon-close"} onClick={onClose}/>
        </div>
    )
}

const ObjItems: FC<{
    objs: ObjMeta[];
}> = ({objs}) => {
    return (
        <ul className={"list-style-none obj-panel-content  scrollbar"}>
            {objs.map((obj) => (
                <li key={obj.hash} className={"obj-panel-item"} >
                    <div className={css`
                        display: flex;
                        justify-content: space-between;
                        
                        padding: 0 10px;
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
