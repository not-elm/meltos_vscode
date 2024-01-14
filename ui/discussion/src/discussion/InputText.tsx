import React, { FC, useState } from "react";
import TextAreaAutoSize from "react-textarea-autosize";
import { SendIcon } from "./codicons/Send";

export const ReplyBox: FC<{
	inputRef: React.RefObject<HTMLTextAreaElement>;
	onClick: (text: string) => void;
}> = ({ onClick, inputRef }) => {
	return (
		<InputBox
			inputRef={inputRef}
			className={"send-box reply-box"}
			onClick={onClick}
		/>
	);
};

export const SpeakBox: FC<{
	onClick: (text: string) => void;
}> = ({ onClick }) => {
	const [text, $text] = useState("");

	return (
		<form className={"speak-box"}>
			<textarea
				rows={1}
				autoFocus={true}
				placeholder={"メッセージを送信"}
				className={"send-input"}
				value={text}
				onChange={(e) => $text(() => e.target.value)}
			/>
			<div className={"send-box-footer"}>
				<SendIcon
					disabled={text === ""}
					onClick={() => {
						onClick(text);
						$text("");
					}}
				/>
			</div>
		</form>
	);
};

const InputBox: FC<{
	inputRef: React.RefObject<HTMLTextAreaElement>;
	className: string;
	onClick: (text: string) => void;
}> = ({ className, inputRef, onClick }) => {
	const [text, $text] = useState("");

	return (
		<form className={className}>
			<TextAreaAutoSize
				rows={1}
				ref={inputRef}
				placeholder={"メッセージを送信"}
				className={"send-input"}
				value={text}
				onChange={(e) => $text(() => e.target.value)}
			/>
			<div className={"send-box-footer"}>
				<SendIcon
					disabled={text === ""}
					onClick={() => {
						onClick(text);
						$text("");
					}}
				/>
			</div>
		</form>
	);
};
