export interface Transcription {
    timestamp: string,
    content: string,
    text: Map<string, string>,
}

export type baseTranscribeParameters = {
  hints?: {
    mode?: "fast" | "precise",
    auto_translate?: boolean,
    big_audio?: boolean,
  }
}

export type transcribeParameters = baseTranscribeParameters & ({
  data: Buffer,
} | {
  path: string,
})

export enum VoiceRecognitionCapabilities {
    Translation = 0
}
