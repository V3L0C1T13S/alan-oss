import { Events } from "discord.js";
import {
  BaseCommand, initParameters, CommandParameter, CommandParameterTypes, Logger,
} from "../../common/index.js";

export default class say extends BaseCommand {
  async run() {
    if (!this.args?.subcommands) return "Give me something to say!";

    const text = this.args.subcommands.text ?? Object.entries(this.args.subcommands).join(" ");

    return text?.toString() ?? "Give me something to say!";
  }

  static description = "Make the bot say something";
  static parameters: CommandParameter[] = [{
    name: "text",
    type: CommandParameterTypes.String,
    description: "The text to make the bot say",
  }];
}
