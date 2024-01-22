import {FC} from "react";
import {VSCodeDivider} from "@vscode/webview-ui-toolkit/react";
import {CommitMeta} from "meltos_ts_lib/src/scm/commit/CommitMeta";
import "./CommitItem.css";
import {IconButton, Tooltip} from "@mui/material";
import {ContentCopy, Merge} from "@mui/icons-material";
import {vscodeApi} from "../VscodeApi.ts";

export const CommitItems: FC<{
    commits: CommitMeta[];
    onSelect: (commit: CommitMeta) => void;
}> = ({commits, onSelect}) => {
    return (
        <ul className={"max-width list-style-none scrollbar clickable"}>
            {commits.map((commit) => (
                <CommitItem
                    key={commit.hash}
                    commit={commit}
                    onSelect={onSelect}
                />
            ))}
        </ul>
    );
};

export const CommitItem: FC<{
    commit: CommitMeta;
    onSelect: (commit: CommitMeta) => void;
}> = ({commit, onSelect}) => {
    return (
        <li
            className={"max-width commit-item-li"}
            onClick={() => onSelect(commit)}
        >
            <div className={"commit-item"}>
                <div className={"commit-item-header"}>
                    <h3 className={"new-line"}>
                        {commit.message === "" ? " " : commit.message}
                    </h3>

                </div>
                <div className={"commit-item-bottom"}>
                    <MergeButton commit={commit}/>
                    <CopyHash commit={commit}/>
                </div>
            </div>
            <VSCodeDivider/>
        </li>
    );
};

const CopyHash: FC<{
    commit: CommitMeta;
}> = ({commit}) => {
    return (
        <div className={"flex hash-item"}>
            <p className={"hash"}>{commit.hash}</p>
            <Tooltip title={"copy hash"}>
                <IconButton
                    sx={{padding: 0}}
                    onClick={async (e) => {
                        e.stopPropagation();
                        await navigator.clipboard.writeText(
                            commit.hash
                        );
                    }}
                >
                    <ContentCopy
                        sx={{fontSize: "0.7em"}}
                        htmlColor={"#4198ff"}
                    />
                </IconButton>
            </Tooltip>
        </div>
    );
};

const MergeButton: FC<{
    commit: CommitMeta;
}> = ({commit}) => {
    return (
        <Tooltip title={"merge"}>
            <IconButton
                sx={{padding: 0}}
                onClick={(e) => {
                    e.stopPropagation();
                    vscodeApi.merge(commit.hash);
                }}>
                <Merge
                    sx={{fontSize: "0.9em"}}
                    htmlColor={"#4198ff"}
                />
            </IconButton>
        </Tooltip>
    );
};
