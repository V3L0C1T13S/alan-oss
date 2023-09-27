import { CommandParameter, CommandParameterTypes, BaseCommand } from "../../common/index.js";

export default class TiktokTTS extends BaseCommand {
  static description = "Generate TTS audio with TikTok.";
  static parameters: CommandParameter[] = [{
    name: "text",
    description: "The text to generate TTS for.",
    type: CommandParameterTypes.String,
  }];
}
