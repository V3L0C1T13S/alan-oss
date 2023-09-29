import { BaseCommand, CommandParameter, CommandParameterTypes } from "../../common/index.js";
import { ErrorMessages } from "../../constants/index.js";

const ops = ["list", "create"];

export default class Conversation extends BaseCommand {
  static description = "Manage your conversations with the AI.";
  static parameters: CommandParameter[] = [{
    name: "op",
    description: `The management OP to carry out. Must be one of ${ops.join(", ")}`,
    type: CommandParameterTypes.String,
    optional: false,
  }];

  async run() {
    const op = this.args?.subcommands?.op ?? this.joinArgsToString();
    if (!op) return ErrorMessages.NotEnoughArgs;

    if (!ops.includes(op.toString())) return `Unsupported op. Please use one of the following: ${ops.join(", ")}`;

    switch (op) {
      case "list": {
        return (await this.bot.aiManager.getConversationsByOwner(this.author.id))
          .map((x) => `${x.id}`)
          .join("\n") || "No conversations.";
      }
      case "create": {
        const conversation = await this.bot.aiManager.createConversation(this.author.id);

        return `Created conversation \`${conversation.id}\``;
      }
      default: return `Unimplemented op ${op}`;
    }
  }
}
