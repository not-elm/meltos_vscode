export interface DiscussionMetaType {
    id: string;
    creator: string;
    title: string;
}

export interface Open{
    user_id: string,   
    lifetime_secs?: number
}

export interface CreatedType {
    meta: DiscussionMetaType;
}

export interface MessageType {
    id: string;
    text: string;
    user_id: string;
}

export interface SpokeType {
    discussion_id: string;
    text: MessageType;
}

export interface RepliedType {
    to: string;
    message: MessageType;
}

export interface ClosedType {
    discussion_id: string
}