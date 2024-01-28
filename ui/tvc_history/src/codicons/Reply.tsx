import { FC } from "react";
import { CodiconIconTemplate } from "./Template";

export const ReplyIcon: FC<{
	onClick?: () => void;
}> = ({ onClick }) => {
	return <CodiconIconTemplate name="codicon-comment" onClick={onClick} />;
};
