import {DiscussionIo} from "./interface.ts";
import {DiscussionData} from "../../DiscussionData";
import { MessageType } from '../../../../../src/types/api';

export class MockDiscussionClient implements DiscussionIo {
    private readonly _discussion: DiscussionData = {
        id: "mockDiscussionId",
        messages: []
    };

    speak(text: string) {
        const message: MessageType = {
            text,
            user_id: "owner",
            id: (this._discussion.messages.length).toString()
        }
        this._discussion.messages.push({
            message,
            replies: []
        });

        window.postMessage({
            type: "discussion",
            data: this._discussion
        })
    }

    reply(to: string, text: string) {
        const message: MessageType = {
            text,
            user_id: "owner",
            id: "replyMockMessageId".toString()
        }

        const toMessage = this
            ._discussion
            .messages
            .find(m => m.message.id == to)!;
        toMessage.replies?.push(message);
        window.postMessage({
            type: "discussion",
            data: this._discussion,
        })
    }
}