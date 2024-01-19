import {FC, useState} from "react";
import {SendIcon} from "../codicons/Send.tsx";
import "./SpeakBox.css";
import "../input.css";

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
				className={"speak-box-input input-box-focusable  input-box"}
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