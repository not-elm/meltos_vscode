import { FC } from "react";

import { css } from "@emotion/css";
import { ObjButtons } from "./Select/ViewButton.tsx";
import { VSCodeDivider } from "@vscode/webview-ui-toolkit/react";
import {CommitMeta} from "meltos_ts_lib/dist/scm/commit/CommitMeta";

export const SelectObj: FC<{
    commit: CommitMeta;
}> = ({ commit }) => {
    return (
        <div>
            <h3>{commit.message}</h3>
            <ObjItems objs={commit.objs} />
        </div>
    );
};

const ObjItems: FC<{
    objs: {
        file_path: string,
        hash: string
    }[];
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
                        <ObjButtons hash={obj.hash} />
                    </div>
                    <VSCodeDivider />
                </li>
            ))}
        </ul>
    );
};
