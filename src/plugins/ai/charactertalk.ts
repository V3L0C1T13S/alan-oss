import { ErrorMessages } from "../../constants/index.js";
import {
  BaseCommand,
  CommandParameter,
  CommandParameterTypes,
  characters,
  ConversationAskConfig,
} from "../../common/index.js";

export default class CharacterTalk extends BaseCommand {
  static description = "Talk to characters!";
  static parameters: CommandParameter[] = [{
    name: "prompt",
    description: "The prompt to send to the AI.",
    type: CommandParameterTypes.String,
    optional: false,
  }, {
    name: "character",
    description: "The character to use.",
    type: CommandParameterTypes.String,
    optional: true,
    choices: Object.entries(characters).map(([key, char]) => ({
      name: char.name,
      value: key,
    })),
  }, {
    name: "hideusername",
    description: "Hide your username from the AI.",
    type: CommandParameterTypes.Bool,
    optional: true,
  }];

  async run() {
    const prompt = this.args?.subcommands?.prompt?.toString() ?? this.joinArgsToString();
    if (typeof prompt !== "string") return ErrorMessages.InvalidArgument;
    const hideName = this.args?.subcommands?.hideusername;
    const characterName = this.args?.subcommands?.character?.toString() ?? "lumine";

    const character = characters[characterName];
    if (!character) return "No character found.";
    await this.ack();

    const user = await this.getDbUser();

    const convo = await this.bot.aiManager.getOrCreateCurrentConversation(user.id);
    const config: ConversationAskConfig = {
      character,
    };
    if (!hideName) config.username = this.author.username;
    const result = await convo.ask(prompt, config);

    return result;
  }
}
