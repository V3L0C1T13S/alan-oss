import { BaseCommand, CommandParameter, CommandParameterTypes } from "../../common/index.js";
import { ErrorMessages } from "../../constants/index.js";

const ops = ["list", "create", "close", "switch"];

export default class Conversation extends BaseCommand {
  static private = true;

  static description = "Manage your conversations with the AI.";
  static parameters: CommandParameter[] = [{
    name: "op",
    description: `The management OP to carry out. Must be one of ${ops.join(", ")}`,
    type: CommandParameterTypes.String,
    optional: false,
  }, {
    name: "conversation",
    description: "The conversation ID to perform the OP on.",
    type: CommandParameterTypes.String,
    optional: true,
  }];

  async run() {
    const op = this.args?.subcommands?.op ?? this.joinArgsToString();
    const conversationId = this.args?.subcommands?.conversation?.toString();

    if (!op) return ErrorMessages.NotEnoughArgs;

    if (!ops.includes(op.toString())) return `Unsupported op. Please use one of the following: ${ops.join(", ")}`;

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

        const conversation = (await this.bot.aiManager.getConversationsByOwner(this.author.id))
          .find((x) => x.id === conversationId);
        if (!conversation) return ErrorMessages.AIConversationNotFound;

        await this.bot.aiManager.closeConversation(conversation.id);

        return "Conversation closed.";
      }
      case "switch": {
        if (!conversationId) return ErrorMessages.NotEnoughArgs;

        await this.bot.aiManager.setCurrentConversation(this.author.id, conversationId);

        return "Conversation switched.";
      }
      default: return `Unimplemented op ${op}`;
    }
  }
}
