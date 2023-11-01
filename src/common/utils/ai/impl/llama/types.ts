export interface ConversationUser {
    name: string,
}

export interface ConversationMessage {
    content: string,
    author: ConversationUser,
}
