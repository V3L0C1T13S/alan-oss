export interface ExampleMessage {
    prompt: string,
    response: string
}

export interface Character {
    name: string,
    personality: string,
    preview_text: string,
    description: string,
    likes?: string[],
    dislikes?: string[],
    examples?: ExampleMessage[],
    appearance?: string,
    clothes?: string,
}

export interface ConversationAskConfig {
    image?: string | Buffer | ArrayBuffer | undefined,
    username?: string,
    character?: Character,
    audio?: Buffer | ArrayBuffer,
}
