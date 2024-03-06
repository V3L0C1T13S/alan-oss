import { AttachmentBuilder } from "discord.js";
import { BaseCommand, CommandParameter, CommandParameterTypes } from "../../common/index.js";
import { ErrorMessages } from "../../constants/errors.js";

export default class TTS extends BaseCommand {
  static description = "Generate realistic-sounding TTS using AI.";
  static parameters: CommandParameter[] = [{
    name: "text",
    description: "The text to use for TTS generation.",
    type: CommandParameterTypes.String,
  }];

  async run() {
    const text = this.joinArgsToString();
    if (!text) return ErrorMessages.NotEnoughArgs;

    await this.ack();
    const audio = await this.bot.ttsManager.generate(text);
    return {
      files: [new AttachmentBuilder(audio).setName("tts.wav")],
    };
  }
}
