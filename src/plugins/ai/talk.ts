import { AttachmentBuilder } from "discord.js";
import {
  Logger,
  BaseCommand,
  CommandParameter,
  CommandParameterTypes,
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
  }, {
    name: "image",
    description: "Send an image to the AI.",
    type: CommandParameterTypes.Attachment,
    optional: true,
  }, {
    name: "url",
    description: "Send a URL of an attachment to the AI.",
    type: CommandParameterTypes.String,
    optional: true,
  }];

  async run() {
    const prompt = this.args?.subcommands?.prompt?.toString() ?? this.joinArgsToString();
    const attachment = await this.getFirstAttachment();
    const url = this.args?.subcommands?.url?.toString();
    const buffer = !url && attachment?.proxy_url
      ? await (await fetch(attachment.proxy_url)).arrayBuffer()
      : undefined;

    if (!prompt) return ErrorMessages.NotEnoughArgs;

    try {
      await this.ack();

      const user = await this.getDbUser();
      const conversation = await this.bot.aiManager.getOrCreateCurrentConversation(user.id);
      const response = await conversation.ask(prompt, {
        image: url ?? buffer,
      });

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
