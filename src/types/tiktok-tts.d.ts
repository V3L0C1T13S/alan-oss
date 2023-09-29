declare module "tiktok-tts" {
    export function config(token: string, baseURL?: string): void;
    export function createAudioFromText(
        text: string,
        fileName?: string,
        speaker?: string
    ): Promise<void>;
}
