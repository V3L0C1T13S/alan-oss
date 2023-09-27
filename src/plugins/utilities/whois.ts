import { EmbedBuilder } from "discord.js";
import { CommandParameterTypes, BaseCommand } from "../../common/index.js";

export default class Whois extends BaseCommand {
  async run() {
    const user = this.args?.users?.[0];
    if (!user) return "Please mention a user!";

    const embed = new EmbedBuilder();

    embed.setFields(
      {
        name: "Username",
        value: user.username,
        inline: true,
      },
      {
        name: "Discriminator",
        value: user.discriminator,
        inline: true,
      },
      {
        name: "ID",
        value: user.id,
        inline: true,
      },
      {
        name: "Creation date",
        value: user.createdAt.toISOString(),
        inline: true,
      },
      {
        name: "Platform",
        value: this.clientType,
        inline: true,
      },
      {
        name: "Avatar",
        value: this.clientType === "revolt" ? `https://autumn.revolt.chat/avatars/${user.avatar}` : user.avatarURL() ?? "No avatar found.",
        inline: true,
      },
    );

    return `ID: ${user.id}
created at: <t:${user.createdTimestamp}:F>
username: ${user.username}
discriminator: ${user.discriminator}
avatar url: ${this.clientType === "revolt" ? `https://autumn.revolt.chat/avatars/${user.avatar}` : user.avatarURL() ?? "No avatar found."}
account type: ${this.clientType}`;
  }

  static description = "Get info about someone";
  static parameters: typeof BaseCommand["parameters"] = [{
    name: "user",
    type: CommandParameterTypes.User,
    description: "The user to get info on",
  }];
}
