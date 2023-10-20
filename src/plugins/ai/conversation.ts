import { BaseCommand, CommandParameter, CommandParameterTypes } from "../../common/index.js";
import { ErrorMessages } from "../../constants/index.js";

const ops = ["list", "create", "close", "switch", "set-template"];

export default class Conversation extends BaseCommand {
  static private = true;

  static description = "Manage your conversations with the AI.";
  static parameters: CommandParameter[] = [{
    name: "op",
    description: `The management OP to carry out. Must be one of ${ops.join(", ")}`,
    type: CommandParameterTypes.String,
    optional: false,
    choices: ops.map((op) => ({
      name: op,
      value: op,
    })),
  }, {
    name: "conversation",
    description: "The conversation ID to perform the OP on.",
    type: CommandParameterTypes.String,
    optional: true,
  }, {
    name: "template",
    description: "Template to set for the conversation.",
    type: CommandParameterTypes.String,
    optional: true,
  }];

  async run() {
    const op = this.args?.subcommands?.op?.toString() ?? this.joinArgsToString();
    const conversationId = this.args?.subcommands?.conversation?.toString();

    if (!op) return ErrorMessages.NotEnoughArgs;

    if (!ops.includes(op)) return `Unsupported op. Please use one of the following: ${ops.join(", ")}`;

    await this.ack();

    switch (op) {
      case "list": {
        return (await this.bot.aiManager.getConversationsByOwner(this.author.id))
          .map((x) => `${x.name}: ${x.id}`)
          .join("\n") || "No conversations.";
      }
      case "create": {
        const conversation = await this.bot.aiManager.createConversation(this.author.id);

        return `Created conversation \`${conversation.id}\``;
      }
      case "close": {
        if (!conversationId) return ErrorMessages.NotEnoughArgs;

        const conversation = await this.bot.aiManager.getConversationByOwner(
          this.author.id,
          conversationId,
        );
        if (!conversation) return ErrorMessages.AIConversationNotFound;

        await this.bot.aiManager.closeConversation(conversation.id);

        return "Conversation closed.";
      }
      case "switch": {
        if (!conversationId) return ErrorMessages.NotEnoughArgs;

        await this.bot.aiManager.setCurrentConversation(this.author.id, conversationId);

        return "Conversation switched.";
      }
      case "set-template": {
        const template = this.args?.subcommands?.template?.toString();
        if (!conversationId || !template) return ErrorMessages.NotEnoughArgs;

        const conversation = await this.bot.aiManager
          .getConversationByOwner(this.author.id, conversationId);
        if (!conversation) return ErrorMessages.AIConversationNotFound;

        try {
          await conversation.setConversationTemplate(template);

          return "Set conversation template.";
        } catch (e) {
          return "Couldn't set conversation template.";
        }
      }
      default: return `Unimplemented op ${op}`;
    }
  }
}
