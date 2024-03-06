import { Logger } from "../../logger.js";
import { ttsBackend } from "../../../../constants/index.js";
import {
  ElevenLabsTTS, GoogleTTS, PlayHtTTS, RVCTts,
} from "./impl/index.js";

export * from "./model/index.js";
export * from "./impl/index.js";

export function createTTSManager() {
  switch (ttsBackend) {
    case "playht": return new PlayHtTTS();
    case "elevenlabs": return new ElevenLabsTTS();
    case "rvc": return new RVCTts();
    case "google": return new GoogleTTS();
    default: {
      Logger.error(`Invalid tts backend ${ttsBackend}. Returning Google TTS.`);
      return new GoogleTTS();
    }
  }
}
