import { ActivityType } from "discord.js";
import { BaseCommand } from "../../common/index.js";
import { revoltOwnerId } from "../../constants/index.js";

export default class avatar extends BaseCommand {
  async run() {
    if (this.author.id !== revoltOwnerId) return "You don't have permission to do this.";

    if (!this.args?.subcommands) return "You need to give me a status!";

    const status = Object.values(this.args.subcommands).join(" ");
    if (!status) return "Couldn't reform status args";

    this.client.user?.presence.set({
      activities: [{
        name: status,
        type: ActivityType.Playing,
      }],
    });

    return `Set status to ${status}`;
  }

  static description = "Set the bots status (or reset it)";
}
