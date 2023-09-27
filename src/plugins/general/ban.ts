import { BaseCommand, CommandParameter, CommandParameterTypes } from "../../common/index.js";

export default class ban extends BaseCommand {
  async run() {
    if (!this.guild) return "bro how am i gonna ban a guy if im not in a guild";
    if (!this.guild.available) return "your guild is down nerd";

    const user = this.args?.users?.[0];
    if (!user) return "You need to give a user to ban!";

    await this.ack();

    await this.guild.members.ban(user, {
      reason: this.args?.subcommands?.reason?.toString() ?? "No reason specified.",
    });

    return `${user.username} has been banned.`;
  }

  static description = "Ban a user from the server";
  static parameters: CommandParameter[] = [{
    name: "user",
    type: CommandParameterTypes.User,
    description: "The user to ban",
  }, {
    name: "reason",
    type: CommandParameterTypes.String,
    description: "The reason to ban the user for",
    optional: true,
  }];
}
