import {FC} from "react";
import {css} from "@emotion/css";
import {VSCodeDivider} from "@vscode/webview-ui-toolkit/react";
import {CommitMeta} from "meltos_ts_lib/dist/scm/commit/CommitMeta";


export const CommitItems: FC<{
    commits: CommitMeta[],
    onSelect: (commit: CommitMeta) => void
}> = ({commits, onSelect}) => {
    const style = css`
        list-style: none;

        :hover {
            cursor: pointer;
        }
    `
    return (
        <ul className={style}>
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
    const root = css`
        display: flex;
        flex-direction: column;
        align-items: flex-start;
    `;

    const bottom = css`
        display: flex;

    `;

    return (
        <li className={root} onClick={() => onSelect(commit)}>
            <h3>{commit.message}</h3>
            <div className={bottom}>
                <p>{commit.hash}</p>
                <img src={"$(refresh)"}/>
            </div>
            <VSCodeDivider/>
        </li>
    );
};
