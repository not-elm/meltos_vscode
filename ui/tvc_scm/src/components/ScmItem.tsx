import {FC} from "react";

import {ChangeMeta} from "meltos_ts_lib/src/scm/changes.ts";
import {fileName} from "meltos_ts_lib/src/file.ts";
import {css} from "@emotion/css";

export const ScmItemText: FC<{
    meta: ChangeMeta
}> =  ({meta}) => {
    const scmItem = css`
        display: flex;
        align-items: center;
        justify-content: start;
        gap: 8px;
    `;

    const scmAbsolutePath = css`
        font-size: 0.8em;
        color: #888888;
    `
    return (
        <div className={scmItem}>
            <p>{fileName(meta.filePath)}</p>
            <p className={scmAbsolutePath}>{meta.filePath}</p>
        </div>
    )
}