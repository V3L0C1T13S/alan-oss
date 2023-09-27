declare module "tiktok-tts" {
    export function config(token: string);
    export function createAudioFromText(text: string, fileName?: string, speaker?: string)
}