import { FC } from "react";

import { css } from "@emotion/css";
import { ObjButtons } from "./Select/ViewButton.tsx";
import { VSCodeDivider } from "@vscode/webview-ui-toolkit/react";
import {CommitMeta, ObjMeta} from "meltos_ts_lib/dist/scm/commit/CommitMeta";

export const SelectObj: FC<{
    commit: CommitMeta;
    onClose: () => void;
}> = ({ commit, onClose }) => {
    return (
        <div>
            <Header commit={commit} onClose={onClose}/>
            <ObjItems objs={commit.objs} />
        </div>
    );
};


const Header: FC<{
    commit: CommitMeta,
    onClose: () => void
}> = ({commit, onClose}) => {
    const root = css`
        display: flex;
    `;
    return (
        <div className={root}>
            <h3>{commit.message}</h3>
            <button onClick={onClose} >×</button>
        </div>
    )
}

const ObjItems: FC<{
    objs: ObjMeta[];
}> = ({ objs }) => {
    const root = css`
        list-style: none;
    `;

    const item = css`
        display: flex;
        justify-content: space-between;
    `;

    return (
        <ul className={root}>
            {objs.map((obj) => (
                <li key={obj.file_path}>
                    <div className={item}>
                        <p>{obj.file_path}</p>
                        <ObjButtons meta={obj} />
                    </div>
                    <VSCodeDivider />
                </li>
            ))}
        </ul>
    );
};
