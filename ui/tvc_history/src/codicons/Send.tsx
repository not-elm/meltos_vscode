import { FC } from "react";
import { CodiconIconTemplate } from "./Template";

export const SendIcon: FC<{
	disabled?: boolean;
	onClick?: () => void;
}> = ({ onClick, disabled }) => {
	return (
		<CodiconIconTemplate
			disabled={disabled}
			name="codicon-debug-continue"
			onClick={onClick}
		/>
	);
};
