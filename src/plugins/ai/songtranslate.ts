import { youtube } from "scrape-youtube";
import { exec } from "node:child_process";
import util from "node:util";
import {
  BaseCommand,
  CommandParameter,
  CommandParameterTypes,
} from "../../common/index.js";
import { ErrorMessages, Messages } from "../../constants/index.js";

const execAsync = util.promisify(exec);

export default class SongTranslate extends BaseCommand {
  static description = "Translates songs from other languages into English using AI.";
  static parameters: CommandParameter[] = [{
    name: "attachment",
    description: "Song to translate",
    type: CommandParameterTypes.Attachment,
  }, {
    name: "language",
    description: "Source language for the song.",
    type: CommandParameterTypes.String,
    choices: [{
      name: "Japanese",
      value: "jp",
    }],
    optional: true,
  }];
  static private = true;

  async run() {
    const attachment = await this.getFirstAttachment();
    const proxyUrl = attachment?.proxy_url;
    if (!proxyUrl) return ErrorMessages.UnproxiedAttachment;

    const data = Buffer.from(await (await fetch(proxyUrl)).arrayBuffer());

    const transcript = await this.bot.voiceRecognitionManager.transcribe({
      data,
    });
    const transcriptTimings = [...transcript.text.entries()];
    /*
    const translatedLyrics = await Promise.all(transcriptTimings.map(async ([time, text]) => {
      const translated = await this.bot.translationManager.translate(text);

      return {
        time,
        translated,
        text,
      };
    }));
    */
    const ttsData = await Promise.all(transcriptTimings.map(async ([time, text]) => {
      const speechData = await this.bot.ttsManager.generate(text);

      return {
        time,
        data: speechData,
        text,
      };
    }));

    return Messages.Unimplemented;
  }
}
