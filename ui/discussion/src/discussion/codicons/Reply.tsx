import {FC} from "react";
import {IconButton, Tooltip} from "@mui/material";
import {Reply} from "@mui/icons-material";

export const ReplyIcon: FC<{
    onClick?: () => void;
}> = ({onClick}) => {
    return (
        // <CodiconIconTemplate name="codicon-comment" onClick={onClick} />
        <Tooltip title={"reply"} onClick={onClick}>
            <IconButton>
                <Reply htmlColor={"#fff"}/>
            </IconButton>
        </Tooltip>
    );
};
