export type APIVercelMessageType = "user" | "assistant";

export interface APIVercelMessage {
    role: APIVercelMessageType,
    content: string;
}
