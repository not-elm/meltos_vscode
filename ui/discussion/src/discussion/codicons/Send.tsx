import {FC} from "react";
import {IconButton} from "@mui/material";
import {Send} from "@mui/icons-material";


export const SendIcon: FC<{
    disabled?: boolean;
    onClick?: () => void;
}> = ({onClick, disabled}) => {
    return (
        <IconButton className={"disable-button-parent"} disabled={disabled} onClick={onClick}>
            <Send className={"primary-color disable-button"}/>
        </IconButton>
    );
};
