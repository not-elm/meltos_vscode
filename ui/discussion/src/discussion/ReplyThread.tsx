import {FC, useContext, useEffect, useRef} from "react";
import {MessageData} from "../DiscussionData";

import {ReplyBox} from "./InputText.tsx";
import {MessageCard} from "./Message.tsx";
import {DiscussionContext} from "./DiscussionThread.tsx";

export type ReplyStatus = "hidden" | "show" | "showFocus";

export const ReplyThread: FC<{
    status: ReplyStatus,
    parentMessageId: string,
    replies: MessageData[]
}> = ({status, parentMessageId, replies}) => {
    const client = useContext(DiscussionContext);
    const ref = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (status === "showFocus") {
            ref?.current?.focus();
        }
    }, [status, ref]);

    return (
        <>
            {status !== "hidden" && (
                <div className={"reply-thread"}>
                    {replies.map(m => (
                        <MessageCard
                            key={m.id}
                            message={m}
                            onClickReply={() => {
                                ref?.current?.focus()
                            }}
                        />
                    ))}
                    <ReplyBox
                        inputRef={ref}
                        onClick={text => {
                            client.reply(parentMessageId, text);
                        }}/>
                </div>
            )}
        </>
    );
}