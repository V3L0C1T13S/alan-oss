import { ActivityType } from "discord.js";
import { BaseCommand, CommandParameter, CommandParameterTypes } from "../../common/index.js";

export default class Status extends BaseCommand {
  static description = "Set the bots status (or reset it)";
  static parameters: CommandParameter[] = [{
    name: "status",
    description: "The status to set the bot to",
    type: CommandParameterTypes.String,
    optional: true,
  }];
  static private = true;

  async run() {
    const status = this.joinArgsToString();
    if (!status) return "Please give a status.";

    this.client.user?.presence.set({
      activities: [{
        name: status,
        type: ActivityType.Playing,
      }],
    });

    return `Set status to ${status}`;
  }
}
