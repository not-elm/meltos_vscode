import {FC} from "react";
import {VSCodeDivider} from "@vscode/webview-ui-toolkit/react";
import {CommitMeta} from "meltos_ts_lib/src/scm/commit/CommitMeta";
import "./CommitItem.css";
import {IconButton, Tooltip} from "@mui/material";
import {ContentCopy} from "@mui/icons-material";

export const CommitItems: FC<{
    commits: CommitMeta[],
    onSelect: (commit: CommitMeta) => void
}> = ({commits, onSelect}) => {
    return (
        <ul className={"max-width list-style-none scrollbar clickable"}>
            {commits.map(commit => (
                <CommitItem key={commit.hash} commit={commit} onSelect={onSelect}/>
            ))}
        </ul>
    )
}


export const CommitItem: FC<{
    commit: CommitMeta;
    onSelect: (commit: CommitMeta) => void
}> = ({commit, onSelect}) => {
    return (
        <li className={"max-width commit-item-li"} onClick={() => onSelect(commit)}>
            <div className={"commit-item"}>
                <h3 className={"commit-item-header"}>{commit.message}</h3>
                <div className={"commit-item-bottom"}>
                    <p className={"hash"}>{commit.hash}</p>
                    <Tooltip title={"copy hash"}>
                        <IconButton
                            style={{
                                padding: 0
                            }}
                            onClick={async (e) => {
                                e.stopPropagation()
                                await navigator.clipboard.writeText(commit.hash)
                            }}
                        >
                            <ContentCopy
                                htmlColor={"#4198ff"}
                            />
                        </IconButton>
                    </Tooltip>
                </div>
            </div>
            <VSCodeDivider/>
        </li>
    );
};
