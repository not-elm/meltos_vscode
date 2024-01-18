import {FC} from "react";
import {IconButton} from "@mui/material";
import {Send} from "@mui/icons-material";


export const SendIcon: FC<{
    disabled?: boolean;
    onClick?: () => void;
}> = ({onClick, disabled}) => {
    return (
        <IconButton disabled={disabled} onClick={onClick}>
            <Send htmlColor={"#43a047"}/>
        </IconButton>
    );
};
