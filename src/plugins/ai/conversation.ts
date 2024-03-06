import { BaseCommand, CommandParameter, CommandParameterTypes } from "../../common/index.js";
import { ErrorMessages } from "../../constants/index.js";

const conversationParameter: CommandParameter = {
  name: "conversation",
  description: "The conversation ID.",
  type: CommandParameterTypes.String,
};

export default class Conversation extends BaseCommand {
  static description = "Manage your conversations with the AI.";
  static parameters: CommandParameter[] = [{
    name: "create",
    description: "Create a conversation",
    type: CommandParameterTypes.Subcommand,
    subcommands: [],
  }, {
    name: "delete",
    description: "Delete a conversation",
    type: CommandParameterTypes.Subcommand,
    subcommands: [conversationParameter],
  }, {
    name: "list",
    description: "List conversations with the AI",
    type: CommandParameterTypes.Subcommand,
    subcommands: [],
  }, {
    name: "close",
    description: "Close a conversation",
    type: CommandParameterTypes.Subcommand,
    subcommands: [conversationParameter],
  }, {
    name: "switch",
    description: "Switch to a conversation",
    type: CommandParameterTypes.Subcommand,
    subcommands: [conversationParameter],
  }, {
    name: "set-template",
    description: "Set the conversation template.",
    type: CommandParameterTypes.Subcommand,
    subcommands: [conversationParameter, {
      name: "template",
      description: "The template to set for the conversation",
      type: CommandParameterTypes.String,
    }],
  }, {
    name: "refresh",
    description: "Create a new conversation and switch to it.",
    type: CommandParameterTypes.Subcommand,
    subcommands: [],
  }];

  async run() {
    if (!this.args?.subcommands) return ErrorMessages.NotEnoughArgs;
    const conversationId = this.args.subcommands.conversation?.toString();
    const {
      list, create, close, refresh,
    } = this.args.subcommands;

    await this.ack();

    const user = await this.getDbUser();

    if (list) {
      return (await this.bot.aiManager.getConversationsByOwner(user.id))
        .map((x) => `${x.name}: ${x.id}`)
        .join("\n") || "No conversations.";
    }
    if (create) {
      const conversation = await this.bot.aiManager.createConversation(user.id);

      return `Created conversation \`${conversation.id}\``;
    }
    if (close) {
      if (!conversationId) return ErrorMessages.NotEnoughArgs;

      const conversation = await this.bot.aiManager.getConversationByOwner(
        user.id,
        conversationId,
      );
      if (!conversation) return ErrorMessages.AIConversationNotFound;

      await this.bot.aiManager.closeConversation(conversation.id);

      return "Conversation closed.";
    }
    if (this.args.subcommands.switch) {
      if (!conversationId) return ErrorMessages.NotEnoughArgs;

      await this.bot.aiManager.setCurrentConversation(user.id, conversationId);

      return "Conversation switched.";
    }
    if (this.args.subcommands["set-template"]) {
      const template = this.args?.subcommands?.template?.toString();
      if (!conversationId || !template) return ErrorMessages.NotEnoughArgs;

      const conversation = await this.bot.aiManager
        .getConversationByOwner(user.id, conversationId);
      if (!conversation) return ErrorMessages.AIConversationNotFound;

      try {
        await conversation.setConversationTemplate(template);

        return "Set conversation template.";
      } catch (e) {
        return "Couldn't set conversation template.";
      }
    }
    if (refresh) {
      const newConversation = await this.bot.aiManager.createConversation(user.id);

      await this.bot.aiManager.setCurrentConversation(user.id, newConversation.id);

      return "Conversation refreshed!";
    }

    return ErrorMessages.InvalidArgument;
  }
}
