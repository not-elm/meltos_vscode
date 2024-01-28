export interface DiscussionData {
    id: string,
    messages: MessageThread[]
}

export interface MessageThread {
    message: MessageData,
    replies?: MessageData[]
}

export interface MessageData {
    id: string,
    user_id: string,
    text: string,
}
