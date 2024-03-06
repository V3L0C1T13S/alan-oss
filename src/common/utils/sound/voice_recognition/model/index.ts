import { Transcription, VoiceRecognitionCapabilities, transcribeParameters } from "./types.js";

export abstract class VoiceRecognitionModel {
  readonly capabilities: VoiceRecognitionCapabilities[] = [];

  abstract transcribe(params: transcribeParameters): Promise<Transcription>
}

export * from "./types.js";
