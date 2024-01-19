import {IconButton, Tooltip} from "@mui/material";
import {FC} from "react";
import {ContentCopy} from "@mui/icons-material";

export const ClipBoardIcon: FC<{
    title: string,
    content: string
}> = ({title, content}) => {
    return (
        <Tooltip title={title}>
            <IconButton
                sx={{padding: 0}}
                onClick={async () => {
                    await navigator.clipboard.writeText(content);
                }}>
                <ContentCopy fontSize={"small"} htmlColor={"#fff"}/>
            </IconButton>
        </Tooltip>
    )
}