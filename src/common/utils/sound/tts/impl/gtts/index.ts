import googleTTS from "google-tts-api";
import { TTSModel } from "../../model/index.js";

export class GoogleTTS extends TTSModel {
  async init() {}

  async generate(text: string) {
    const ttsAudio = await googleTTS.getAudioBase64(text.slice(0, 200), {
      lang: "en",
      slow: false,
      host: "https://translate.google.com",
      timeout: 10000,
    });
    const audioBuffer = Buffer.from(ttsAudio, "base64");

    return audioBuffer;
  }
}
