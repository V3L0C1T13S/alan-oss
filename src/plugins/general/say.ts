import {
  BaseCommand, CommandParameter, CommandParameterTypes,
} from "../../common/index.js";

export default class say extends BaseCommand {
  static private = true;
  static description = "Make the bot say something.";
  static parameters: CommandParameter[] = [{
    name: "text",
    type: CommandParameterTypes.String,
    description: "The text to make the bot say.",
  }];

  async run() {
    if (!this.args?.subcommands) return "Give me something to say!";

    const text = this.args.subcommands.text ?? this.joinArgsToString();

    return text?.toString() ?? "Give me something to say!";
  }
}
