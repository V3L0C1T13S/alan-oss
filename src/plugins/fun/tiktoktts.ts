import tiktok from "tiktok-tts";
import path from "node:path";
import { mkdir, readFile } from "node:fs/promises";
import { ulid } from "ulid";
import { AttachmentBuilder } from "discord.js";
import {
  CommandParameter, CommandParameterTypes, BaseCommand, initParameters, Logger, TiktokVoiceTable,
} from "../../common/index.js";
import {
  ErrorMessages, alanTmpDir, tikTokAPIURL, tiktokSessionId,
} from "../../constants/index.js";

const tiktokVoices: TiktokVoiceTable = JSON.parse((await readFile(path.join(process.cwd(), "resources/tiktok_tts_table.json"))).toString("utf-8"));
const tiktokTempDir = path.join(alanTmpDir, "tiktok-audio");

export default class TiktokTTS extends BaseCommand {
  async run() {
    if (!tiktokSessionId) return "This bot's host hasn't properly configured TikTok TTS yet.";

    const text = this.args?.subcommands?.text ?? this.joinArgsToString();
    const voice = this.args?.subcommands?.voice;
    if (typeof text !== "string") return ErrorMessages.NotEnoughArgs;

    const filePath = path.join(tiktokTempDir, ulid());

    await this.ack();

    try {
      await tiktok.createAudioFromText(text, filePath, voice?.toString());

      const buffer = await readFile(`${filePath}.mp3`);

      const attachment = new AttachmentBuilder(buffer)
        .setName("tts.mp3")
        .setDescription(`"${text}" as TikTok text to speech.`);

      return {
        content: "Done!",
        files: [attachment],
      };
    } catch (e) {
      Logger.error("TikTokTTS:", e);

      return ErrorMessages.TTSFailed;
    }
  }

  static async init(params: initParameters) {
    await super.init(params);

    if (tiktokSessionId) {
      await mkdir(tiktokTempDir, { recursive: true });

      tiktok.config(tiktokSessionId, tikTokAPIURL);
    }

    return this;
  }

  static description = "Generate TTS audio with TikTok.";
  static parameters: CommandParameter[] = [{
    name: "text",
    description: "The text to generate TTS for.",
    type: CommandParameterTypes.String,
  }, {
    name: "voice",
    description: "The voice to use for TTS.",
    type: CommandParameterTypes.String,
    optional: true,
    choices: tiktokVoices.speakers.map((x) => ({
      name: x.name,
      value: x.code,
    })),
  }];
}
