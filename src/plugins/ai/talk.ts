import {
  Logger, BaseCommand, CommandParameter, CommandParameterTypes, isOwner,
} from "../../common/index.js";
import {
  ErrorMessages, Messages,
} from "../../constants/index.js";

export default class AITalk extends BaseCommand {
  static private = true;

  async run() {
    if (!isOwner(this.author.id, this.clientType)) return ErrorMessages.DeveloperOnlyCommand;
    if (!this.message || !this.args?.subcommands) return Messages.InteractionsNotSupported;

    const prompt = this.message.content.replaceAll("a!talk ", "");
    const promptV2 = this.args.subcommands.prompt ?? this.joinArgsToString();
    if (!promptV2) return ErrorMessages.NotEnoughArgs;

    Logger.log(prompt);
    Logger.log(promptV2);

    try {
      await this.ack();
      const response = await this.bot.aiManager.ask(prompt);

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
