import { WhisperChild } from "./impl/whisper_child.cpp/index.js";

export * from "./model/index.js";
export * from "./impl/index.js";

export function createVoiceRecognitionManager() {
  return new WhisperChild();
}
