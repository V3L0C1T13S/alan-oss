import { EmbedBuilder } from "discord.js";
import { BaseCommand, CommandParameter, CommandParameterTypes } from "../../common/index.js";
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
          value: command.parameters.map((x) => `${x.name} ${x.description}`).join("\n"),
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

    const embed = new EmbedBuilder();
    embed.setAuthor({
      name: "Help",
    });
    embed.setTitle(prefix);
    embed.setDescription("Commands");
    embed.setFooter({
      text: "Tip: Add a command argument to get more help on a command!",
    });
    embed.addFields([...commandMap.entries()].map(([category, x]) => ({
      name: category,
      value: x.map((command) => `**${command.name.toLowerCase()}** - ${(command as any).description}`).join("\n"),
    })));

    return {
      embeds: [embed.toJSON()],
    };
  }

  static parameters: CommandParameter[] = [{
    name: "command",
    description: "The command to get help on.",
    optional: false,
    type: CommandParameterTypes.String,
  }];

  static description = "Stop it. Get some help.";
}
