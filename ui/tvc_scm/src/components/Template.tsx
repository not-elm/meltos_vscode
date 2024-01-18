import { FC } from "react";

export const CodiconIconTemplate: FC<{
    name: string,
	color?: string,
    disabled?: boolean,
	onClick?: () => void;
}> = ({ onClick, color, name, disabled }) => {
	return (
		<i
			className={`codicon ${name}`}
			color={color}
			style={{
				color
			}}
			onClick={() => {
				if (!disabled) {
					onClick?.();
				}
			}}
		></i>
	);
};
