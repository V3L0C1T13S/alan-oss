import { EmbedAuthorOptions, EmbedBuilder } from "discord.js";
import {
  BaseCommand, CommandParameter, CommandParameterTypes, paginate,
} from "../../common/index.js";
import { botPrefix } from "../../constants/index.js";

export default class help extends BaseCommand {
  async run() {
    const commandName = this.args?.subcommands?.["command"] ?? this.joinArgsToString();

    if (commandName && typeof commandName === "string") {
      const command = this.bot.pluginManager.commands.get(commandName);
      if (!command) return "Command not found.";

      const embed = new EmbedBuilder()
        .setTitle(command.name)
        .setDescription(command.description)
        .setFields({
          name: "Params",
          value: command.parameters.map((x) => `${x.name} - ${x.description}`).join("\n") || "No params.",
        });

      return {
        embeds: [embed.toJSON()],
      };
    }

    const prefix = botPrefix;

    const commandMap = new Map<string, BaseCommand[]>();

    [...this.bot.pluginManager.commands.entries()]
      .forEach(([name, command]) => {
        const category = commandMap.get(command.category) ?? [];

        category.push(command);

        commandMap.set(command.category, category);
      });

    const embeds = [...commandMap.entries()].map(([category, cmds]) => {
      const embed = new EmbedBuilder();
      const avatarURL = this.client.user?.avatarURL();
      const author: EmbedAuthorOptions = {
        name: "Help",
      };
      if (avatarURL) author.iconURL = avatarURL;

      embed.setAuthor(author);
      embed.setTitle(prefix);
      embed.setDescription(category);
      embed.setFooter({
        text: "Tip: Add a command argument to get more help on a command!",
      });

      embed.addFields({
        name: "Commands",
        value: cmds.map((command) => `**${command.name.toLowerCase()}** - ${(command as any).description}`).join("\n"),
      });

      return embed.toJSON();
    });

    const options: any = {};
    if (this.message) options.message = this.message;
    if (this.interaction) options.interaction = this.interaction;

    await paginate(this.client, {
      ...options,
      author: this.author,
      client_type: this.clientType,
    }, embeds);

    return null;
  }

  static parameters: CommandParameter[] = [{
    name: "command",
    description: "The command to get help on.",
    optional: true,
    type: CommandParameterTypes.String,
  }];

  static description = "Stop it. Get some help.";
}
