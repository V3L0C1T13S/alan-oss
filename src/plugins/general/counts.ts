import { EmbedBuilder } from "discord.js";
import { BaseCommand } from "../../common/index.js";

export default class counts extends BaseCommand {
  static description = "Get statistics on popular commands.";

  async run() {
    const commandCounts = await this.bot.database.getCounts();

    const embed = new EmbedBuilder()
      .setTitle("Counts")
      .setDescription(Object.entries(commandCounts).map(([name, count]) => `**${name}** - ${count}`).join("\n"));

    return {
      embeds: [embed.toJSON()],
    };
  }
}
