import { ChannelType } from "discord.js";
import { ErrorMessages } from "../../constants/index.js";
import {
  BaseCommand,
  CommandParameter,
  CommandParameterTypes,
  characters,
  ConversationAskConfig,
  MessageFormatter,
  Logger,
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
    optional: false,
    choices: Object.entries(characters).map(([key, char]) => ({
      name: char.name,
      value: key,
    })),
  }, {
    name: "attachment",
    description: "Send an image to the AI.",
    type: CommandParameterTypes.Attachment,
    optional: true,
  }, {
    name: "hideusername",
    description: "Hide your username from the AI.",
    type: CommandParameterTypes.Bool,
    optional: true,
  }, {
    name: "thread",
    description: "Create a thread to talk to the character in.",
    type: CommandParameterTypes.Bool,
    optional: true,
  }];

  async run() {
    const attachment = await this.getFirstAttachment({
      disallowLastMessage: true,
    });
    const prompt = this.args?.subcommands?.prompt?.toString() ?? this.joinArgsToString();
    const hideName = this.args?.subcommands?.hideusername;
    const thread = this.args?.subcommands?.thread;
    const characterName = this.args?.subcommands?.character?.toString();

    if (!prompt || !characterName) return ErrorMessages.NotEnoughArgs;

    const character = characters[characterName];
    if (!character) return "No character found.";
    await this.ack();

    const user = await this.getDbUser();

    const convo = await this.bot.aiManager.getOrCreateCurrentConversation(user.id);
    const config: ConversationAskConfig = {
      character,
      image: attachment?.proxy_url,
    };
    if (!hideName) config.username = this.author.username;
    const result = await convo.ask(prompt, config);

    if (thread && this.channel?.type === ChannelType.GuildText) {
      try {
        const aiThread = await this.bot.aiThreadManager.createThread(convo, {
          startMessage: this.message,
          channel: this.channel,
        });

        await aiThread.addMember(this.author);
        const responseMessage = await aiThread.send(result);
        return responseMessage.url;
      } catch (e) {
        Logger.error("Failed to create thread:", e);

        return MessageFormatter.AIThreadCreateError(this.clientType);
      }
    }

    return result;
  }
}
