import { FC } from "react";

export const CodiconIconTemplate: FC<{
    name: string,
    disabled?: boolean,
	onClick?: () => void;
}> = ({ onClick, name, disabled }) => {
	return (
		<div className="icon" >
			<i
				className={`codicon ${name}`}
                onClick={() => {
                    if(!disabled){
                        onClick?.();
                    }
				}}
			></i>
		</div>
	);
};
