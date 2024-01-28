import { FC, useMemo, useState } from "react";
import { VSCodeDivider } from "@vscode/webview-ui-toolkit/react";
import { MessageData, MessageThread } from "../DiscussionData";
import { ReplyStatus, ReplyThread } from "./reply/ReplyThread.tsx";
import { ReplyIcon } from "./codicons/Reply.tsx";
import {ClipBoardIcon} from "./codicons/ClipBoardIcon.tsx";
import "../index.css";
import "./Message.css";
import "../color.css";

export const DiscussionMessages: FC<{
    messages: MessageThread[];
}> = ({ messages }) => {
    return (
        <div className={"discussion-root"}>
            {messages.map((m) => (
                <DiscussionMessage message={m} key={m.message.id} />
            ))}
        </div>
    );
};

export const DiscussionMessage: FC<{
    message: MessageThread;
}> = ({ message }) => {
    const [visibleReply, $visibleReply] = useState<ReplyStatus>("hidden");
    const replyLinkText = useMemo(() => {
        return message.replies && visibleReply === "hidden"
            ? `${message.replies.length}件の返信`
            : "全て非表示";
    }, [message.replies, visibleReply]);

    return (
        <div className={"discussion-message"}>
            <MessageCard
                message={message.message}
                onClickReply={() => {
                    $visibleReply(
                        visibleReply === "hidden" ? "showFocus" : "hidden"
                    );
                }}
            />
            <div className={"reply-thread"}>
                {0 < (message.replies?.length || 0) && (
                    <p
                        className={"reply-link primary-color"}
                        onClick={() => {
                            $visibleReply(
                                visibleReply === "hidden" ? "show" : "hidden"
                            );
                        }}
                    >
                        {replyLinkText}
                    </p>
                )}
                <ReplyThread
                    status={visibleReply}
                    parentMessageId={message.message.id}
                    replies={message.replies || []}
                />
            </div>
            <VSCodeDivider />
        </div>
    );
};

export const MessageCard: FC<{
    message: MessageData;
    onClickReply: (messageId: string) => void;
}> = ({ message, onClickReply }) => {
    return (
        <div className={"message-card"}>
            <MessageHeader
                userId={message.user_id}
                messageId={message.id}
                onClickReply={onClickReply}
            />
            <div>
                <p className={"message-text output-new-line"}>{message.text}</p>
            </div>
        </div>
    );
};

const MessageHeader: FC<{
    userId: string;
    messageId: string;
    onClickReply: (messageId: string) => void;
}> = ({ userId, messageId, onClickReply }) => {
    return (
        <div className={"message-header"}>
            <p className="user-id">{userId}</p>
            <div className={"message-menus"}>
                <ReplyIcon
                    onClick={() => {
                        onClickReply(messageId);
                    }}
                />
                <ClipBoardIcon
                    title={"copy message id"}
                    content={messageId} />
            </div>
        </div>
    );
};
