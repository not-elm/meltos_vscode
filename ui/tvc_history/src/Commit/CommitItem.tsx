import {FC} from "react";
import {VSCodeDivider} from "@vscode/webview-ui-toolkit/react";
import {CommitMeta} from "meltos_ts_lib/dist/scm/commit/CommitMeta";
import "./CommitItem.css";

export const CommitItems: FC<{
    commits: CommitMeta[],
    onSelect: (commit: CommitMeta) => void
}> = ({commits, onSelect}) => {
    return (
        <ul className={"max-width list-style-none scrollbar"}>
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
                    <p>{commit.hash}</p>
                    <div className="icon">
                        <i className={`codicon codicon-repo`}></i>
                    </div>
                </div>
            </div>
            <VSCodeDivider/>
        </li>
    );
};
