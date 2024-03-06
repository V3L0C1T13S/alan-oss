// @ts-ignore
import ElevenLabs from "elevenlabs-node";
import path from "node:path";
import { readFile } from "node:fs/promises";
import { ulid } from "ulid";
import { TTSModel } from "../../model/index.js";
import { alanTmpDir, elevenLabsAPIKey, elevenLabsVoiceId } from "../../../../../../constants/index.js";

export class ElevenLabsTTS extends TTSModel {
  private voice = new ElevenLabs({
    apiKey: elevenLabsAPIKey,
    voiceId: elevenLabsVoiceId,
  });

  async init() {}

  async generate(text: string) {
    const audioBufferPath = path.join(alanTmpDir, "audio", ulid());

    await this.voice.textToSpeech({
      fileName: audioBufferPath,
      textInput: text,
    });

    return readFile(audioBufferPath);
  }
}
