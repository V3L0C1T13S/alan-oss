import { mkdir, readFile, rm } from "node:fs/promises";
import tiktok from "tiktok-tts";
import path from "node:path";
import { ulid } from "ulid";
import { TTSModel } from "../../model/index.js";
import { alanTmpDir, tikTokAPIURL, tiktokSessionId } from "../../../../../../constants/index.js";

const tiktokTempDir = path.join(alanTmpDir, "tiktok-audio");

export class TiktokTTSModel extends TTSModel {
  async init() {
    if (!tiktokSessionId) throw new Error("Please set your TikTok session id!");

    await mkdir(tiktokTempDir, { recursive: true });

    tiktok.config(tiktokSessionId, tikTokAPIURL);
  }

  async generate(text: string, hints?: {
    tiktok?: {
        voice?: string | undefined
    }
  }) {
    const filePath = path.join(tiktokTempDir, ulid());
    await tiktok.createAudioFromText(text, filePath, hints?.tiktok?.voice?.toString());
    const mp3Path = `${filePath}.mp3`;

    const buffer = await readFile(mp3Path);
    await rm(mp3Path);

    return buffer;
  }
}
