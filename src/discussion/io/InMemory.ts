import {DiscussionData, DiscussionIo, MessageData, MessageThread,} from "./DiscussionIo";

import {ClosedType, CreatedType, DiscussionMetaType, MessageType, RepliedType, SpokeType,} from "../../types/api";
import {DiscussionBundleType} from "meltos_ts_lib/dist/discussion";

export class InMemoryDiscussionIo implements DiscussionIo {
    private readonly _messages = new Map<string, MessageType>();
    private readonly _discussions = new Map<
        string,
        {
            meta: DiscussionMetaType;
            messages: string[];
        }
    >();

    private readonly _replies = new Map<string, string[]>();


    async sync(discussions: DiscussionBundleType[]): Promise<void> {
        this.syncDiscussions(discussions);
        this.syncMessages(discussions);
        this.syncReplies(discussions);
    }


    async created(created: CreatedType): Promise<void> {
        this._discussions.set(created.meta.id, {
            meta: created.meta,
            messages: [],
        });
    }

    async spoke(spoke: SpokeType): Promise<void> {
        const messageId = spoke.message.id;
        this._messages.set(messageId, spoke.message);
        const discussion = this._discussions.get(spoke.discussion_id);
        if (discussion) {
            discussion.messages.push(messageId);
            this._discussions.set(spoke.discussion_id, discussion);
        } else {
            throw new Error(`Not found discussion : id=${spoke.discussion_id}`);
        }
    }

    async replied(replied: RepliedType): Promise<void> {
        const messageId = replied.message.id;
        const to = replied.to;
        const reply = this._replies.get(to);
        if (reply) {
            reply.push(messageId);
            this._replies.set(to, reply);
        } else {
            this._replies.set(to, [messageId]);
        }
        this._messages.set(messageId, replied.message);
    }

    async closed(closed: ClosedType): Promise<void> {
        const discussion = this._discussions.get(closed.discussion_id);
        if (discussion) {
            discussion.messages.forEach((id) => {
                this._messages.delete(id);
                this._replies.delete(id);
            });
            this._discussions.delete(closed.discussion_id);
        }
    }

    async dispose(): Promise<void> {
        // this._discussions.clear();
        // this._replies.clear();
        // this._messages.clear();
    }

    discussionIds(): DiscussionMetaType[] {
        return [...this._discussions.values()].map((d) => d.meta);
    }

    discussion(id: string): DiscussionData | undefined {
        const discussion = this._discussions.get(id);
        if (!discussion) {
            return undefined;
        }
        const messages: MessageThread[] = [];
        for (const messageId of discussion.messages) {
            const message = this._messages.get(messageId);
            if (!message) {
                continue;
            }
            messages.push({
                message,
                replies: this.getReplies(messageId),
            });
        }

        return {
            meta: discussion.meta,
            messages,
        };
    }


    private syncMessages(discussions: DiscussionBundleType[]) {
        this._messages.clear();
        for (const message of discussions.flatMap(d => d.messages)) {
            this._messages.set(message.message.id, message.message);
            for (const reply of message.replies) {
                this._messages.set(reply.id, reply);
            }
        }
    }


    private syncReplies(discussions: DiscussionBundleType[]) {
        this._replies.clear();
        for (const message of discussions.flatMap(d => d.messages)) {
            if (0 < message.replies.length) {
                this._replies.set(message.message.id, message.replies.map(m => m.id));
            }
        }
    }

    private syncDiscussions(discussions: DiscussionBundleType[]) {
        this._discussions.clear();
        for (const d of discussions) {
            this._discussions.set(d.meta.id, {
                meta: d.meta,
                messages: d.messages.map(m => m.message.id)
            })
        }
    }

    private getReplies(messageId: string): MessageData[] | undefined {
        const replies = this._replies.get(messageId);
        if (!replies) {
            return undefined;
        }
        return replies.map((id) => this._messages.get(id)!);
    }
}
