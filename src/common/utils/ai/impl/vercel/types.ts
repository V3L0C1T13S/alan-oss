export type APIVercelMessageType = "user" | "assistant";

export interface APIVercelMessage {
    role: APIVercelMessageType,
    content: string;
}

export type VercelPrompt = string;
export type VercelResponse = string;

export type VercelUser = {
    id: string,
    current_conversation?: string | null,
}
