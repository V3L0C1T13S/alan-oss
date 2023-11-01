export interface ConversationUser {
    name: string,
    id: string,
}

export interface ConversationMessage {
    content: string,
    author: ConversationUser,
}

export interface ConversationData {
    messages: ConversationMessage[],
    users: ConversationUser[],
    owner: string,
    id: string,
    name: string,
}

export type FindConversationData = Pick<ConversationData, "id" | "owner">
export type EditConversationData = Pick<ConversationData, "messages" | "users">;
