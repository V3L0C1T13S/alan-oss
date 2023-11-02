import { AttachmentBuilder } from "discord.js";
import {
  Logger, BaseCommand, CommandParameter, CommandParameterTypes,
} from "../../common/index.js";
import {
  ErrorMessages,
} from "../../constants/index.js";

const maxMessageLength = 2000;

export default class Talk extends BaseCommand {
  static private = true;

  static description = "Talk to the AI.";
  static parameters: CommandParameter[] = [{
    name: "prompt",
    description: "The prompt to send to the AI.",
    type: CommandParameterTypes.String,
    optional: false,
  }];

  async run() {
    const prompt = this.args?.subcommands?.prompt ?? this.joinArgsToString();
    if (!prompt) return ErrorMessages.NotEnoughArgs;

    try {
      await this.ack();

      const user = await this.getDbUser();
      const conversation = await this.bot.aiManager.getOrCreateCurrentConversation(user.id);
      const response = await conversation.ask(prompt.toString());

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
}
