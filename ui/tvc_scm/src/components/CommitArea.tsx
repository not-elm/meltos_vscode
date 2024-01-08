import {FC, useState} from "react";
import TextAreaAutoSize from "react-textarea-autosize";
import {VSCodeButton} from "@vscode/webview-ui-toolkit/react";
import {vscodeApi} from "../client/VscodeApi.ts";
import {css} from "@emotion/css";

export const CommitArea: FC = () => {
    const [text, $text] = useState("")
    const form = css`
        display: flex;
        flex-direction: column;
        padding: 8px;
    `;

    const textArea = css`
        width: 100%;
        resize: vertical;
        border: 1px solid #123e6c;
        padding: 8px;

        :focus {
            border: 1px solid #458cd5;
        }
    `
    const commitButtonBox = css`
        margin: 8px 0;
    `

    return (
        <form className={form}>
            <TextAreaAutoSize
                rows={1}
                className={textArea}
                value={text}
                placeholder={"commit message"}
                onChange={e => {
                    $text(() => e.target.value);
                }}
            />

            <VSCodeButton
                className={commitButtonBox}
                disabled={text === ""}
                onClick={() => {
                    vscodeApi.commit(text);
                    $text(() => "");
                }}
            >
                Commit
            </VSCodeButton>
        </form>
    )
}