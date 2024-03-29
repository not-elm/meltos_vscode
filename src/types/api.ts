export interface DiscussionMetaType {
    id: string;
    creator: string;
    title: string;
}

export interface JoinedType{
    user_id: string
}

export interface LeftType{
    user_id: string
}

export interface Open {
    bundle: any,
    lifetime_secs?: number
}

export interface CreatedType {
    name: "discussion.global.created"
    meta: DiscussionMetaType;
}

export interface MessageType {
    id: string;
    text: string;
    user_id: string;
}

export interface SpokeType {
    discussion_id: string;
    message: MessageType;
}

export interface RepliedType {
    discussion_id: string;
    to: string;
    message: MessageType;
}

export interface ClosedType {
    discussion_id: string
}
