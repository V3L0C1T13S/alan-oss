import PlayHT from "playht";
import { TTSModel } from "../../model/index.js";
import { playHTId, playHTKey, playHtVoiceId } from "../../../../../../constants/index.js";

export class PlayHtTTS extends TTSModel {
  async init() {
    if (!playHTKey || !playHTId || !playHtVoiceId) throw new Error("Please set your playHT ID, key, and voice ID to use playHT TTS.");
    PlayHT.init({
      apiKey: playHTKey,
      userId: playHTId,
      defaultVoiceId: playHtVoiceId,
      defaultVoiceEngine: "PlayHT2.0",
    });
  }

  async generate(text: string) {
    const ttsResult = await PlayHT.generate(text);
    const buffer = await fetch(ttsResult.audioUrl);
    return Buffer.from(await buffer.arrayBuffer());
  }
}
