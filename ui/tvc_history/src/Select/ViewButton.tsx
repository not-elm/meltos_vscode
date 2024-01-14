import { css } from "@emotion/css";
import { FC } from "react";
import { vscodeApi } from "../VscodeApi.ts";
import { ObjMeta } from "meltos_ts_lib/dist/scm/commit/CommitMeta.ts";

export const ObjButtons: FC<{
    meta: ObjMeta;
}> = ({ meta }) => {
    const root = css`
        display: flex;
        background: #3c3c3c;
      
        padding: 8px;
    `;

    return (
        <div className={root}>
            <ViewButton meta={meta} />
            <CompareButton meta={meta} />
        </div>
    );
};

const ViewButton: FC<{
    meta: ObjMeta;
}> = ({ meta }) => {
    return (
        <ButtonBase
            imgSrc={""}
            text={"View"}
            onClick={() => {
                vscodeApi.showFile(meta);
            }}
        />
    );
};

const CompareButton: FC<{
    meta: ObjMeta;
}> = ({ meta }) => {
    return (
        <ButtonBase
            imgSrc={""}
            text={"Workspace"}
            onClick={() => {
                vscodeApi.showDiffFromWorkspace(meta);
            }}
        />
    );
};

const ButtonBase: FC<{
    imgSrc: string;
    text: string;
    onClick: () => void;
}> = ({ imgSrc, text, onClick }) => {
    const root = css`
        display: flex;
        color: #007acc;
        gap: 8px;

        :hover {
            cursor: pointer;
        }
    `;

    return (
        <div className={root} onClick={onClick}>
            <img src={imgSrc} />
            <p>{text}</p>
        </div>
    );
};
