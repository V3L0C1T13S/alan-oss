export interface ConversationUser {
    name: string,
    id: string,
}

export interface ConversationMessage {
    content: string,
    author: string,
    conversation: string,
}

export interface ConversationData {
    messages: ConversationMessage[],
    users: ConversationUser[],
    owner: string,
    id: string,
    name: string,
}

export type FindConversationData = Pick<ConversationData, "id">
export type FindConversationByOwnerData = FindConversationData & { owner: string };
export type EditConversationData = Pick<ConversationData, "messages" | "users">;
