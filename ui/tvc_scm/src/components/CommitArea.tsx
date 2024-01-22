import {FC, useContext, useState} from "react";
import TextAreaAutoSize from "react-textarea-autosize";
import {VSCodeButton} from "@vscode/webview-ui-toolkit/react";
import {vscodeApi} from "../client/VscodeApi.ts";
import {css} from "@emotion/css";
import {ScmContext, useScm} from "../client/useScm.ts";

export const CommitArea: FC = () => {
    const {stages} = useScm();

    const [text, $text] = useState("");
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
    `;
    const commitButtonBox = css`
        margin: 8px 0;
    `;

    return (
        <form className={form}>
            <TextAreaAutoSize
                rows={1}
                disabled={stages.length === 0}
                className={textArea}
                value={text}
                placeholder={"commit message"}
                onChange={(e) => {
                    $text(() => e.target.value);
                }}
            />

            <VSCodeButton
                className={commitButtonBox}
                disabled={text === "" || stages.length === 0}
                onClick={() => {
                    vscodeApi.commit(text);
                    $text(() => "");
                }}
            >
                Commit
            </VSCodeButton>

            <PushButton/>
        </form>
    );
};

const PushButton = () => {
    const {canPush} = useContext(ScmContext);

    return (
        <VSCodeButton
            disabled={!canPush}
            onClick={() => {
                vscodeApi.push();
            }}
        >
            Push
        </VSCodeButton>
    );
};
