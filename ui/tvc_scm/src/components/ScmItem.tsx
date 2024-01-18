import {FC} from "react";

import {ChangeMeta} from "meltos_ts_lib/src/scm/changes.ts";
import {fileName} from "meltos_ts_lib/src/file.ts";
import "./ScmItem.css";
import {vscodeApi} from "../client/VscodeApi.ts";

export const ScmItemText: FC<{
    meta: ChangeMeta
}> = ({meta}) => {
    return (
        <div className={"scm-item"} onClick={() => {
            vscodeApi.showDiff(meta);
        }}>
            <p className={`file-name ${meta.changeType === "delete" ? "delete-line" : ""}`}  >{fileName(meta.filePath)}</p>
            <p className={"absolute-path"}>{meta.filePath}</p>
        </div>
    )
}