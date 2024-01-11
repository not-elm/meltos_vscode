import {css} from "@emotion/css";
import {FC} from "react";
import {vscodeApi} from "../VscodeApi.ts";


export const ObjButtons: FC<{
    hash: string
}> = ({hash}) => {
    const root = css`
        display: flex;
        background: #3c3c3c;
        gap: 10px;
        padding: 8px;
    `;

    return (
        <div className={root}>
            <ViewButton hash={hash}/>
            <CompareButton hash={hash}/>
        </div>
    )
}


const ViewButton: FC<{
    hash: string,
}> = ({hash}) => {

    return (
        <ButtonBase
            imgSrc={""}
            text={"View"}
            onClick={() => {
                vscodeApi.showFile(hash)
            }}
        />
    )
}


const CompareButton: FC<{
    hash: string
}> = ({hash}) => {
    return (
        <ButtonBase
            imgSrc={""}
            text={"Workspace"}
            onClick={() => {
                vscodeApi.showFile(hash);
            }}
        />
    )
}


const ButtonBase: FC<{
    imgSrc: string,
    text: string,
    onClick: () => void
}> = ({imgSrc, text, onClick}) => {
    const root = css`
        display: flex;
        color: #007acc;
        gap: 8px;

        :hover {
            cursor: pointer;
        }
    `;

    return (
        <div
            className={root}
            onClick={onClick}
        >
            <img src={imgSrc}/>
            <p>{text}</p>
        </div>
    )
}