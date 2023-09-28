import { AttachmentBuilder } from "discord.js";
import {
  Logger, BaseCommand, CommandParameter, CommandParameterTypes, isOwner,
} from "../../common/index.js";
import {
  ErrorMessages,
} from "../../constants/index.js";

const maxMessageLength = 2000;

export default class AITalk extends BaseCommand {
  static private = true;

  async run() {
    const prompt = this.args?.subcommands?.prompt ?? this.joinArgsToString();
    if (!prompt) return ErrorMessages.NotEnoughArgs;

    Logger.log(prompt);

    try {
      await this.ack();
      const response = await this.bot.aiManager.ask(prompt.toString());

      if (response.length > maxMessageLength) {
        return {
          content: "The AI blew over the length limit. Here's your response.",
          files: [new AttachmentBuilder(Buffer.from(response, "utf-8")).setName("response.txt")],
        };
      }

      return response;
    } catch (e) {
      Logger.error("AI:", e);
      return ErrorMessages.AIError;
    }
  }

  static description = "Talk to the AI.";
  static parameters: CommandParameter[] = [{
    name: "prompt",
    description: "The prompt to send to the AI.",
    type: CommandParameterTypes.String,
    optional: false,
  }];
}
