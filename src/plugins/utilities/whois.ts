import { EmbedBuilder } from "discord.js";
import { CommandParameterTypes, BaseCommand, getUserAvatarURL } from "../../common/index.js";

export default class Whois extends BaseCommand {
  static description = "Get info about someone";
  static parameters: typeof BaseCommand["parameters"] = [{
    name: "user",
    type: CommandParameterTypes.User,
    description: "The user to get info on",
  }];

  async run() {
    const user = this.args?.users?.[0];
    if (!user) return "Please mention a user!";

    const createdAt = Math.round(user.createdTimestamp / 1000);
    const avatar = getUserAvatarURL(user, this.clientType);

    const embed = new EmbedBuilder();
    embed.setFields(
      {
        name: "Username",
        value: user.username,
        inline: true,
      },
      {
        name: "Discriminator",
        value: user.discriminator === "0" ? "Pomelo" : user.discriminator,
        inline: true,
      },
      {
        name: "ID",
        value: user.id,
        inline: true,
      },
      {
        name: "Creation date",
        value: `<t:${createdAt}:F>`,
        inline: true,
      },
      {
        name: "Platform",
        value: this.clientType,
        inline: true,
      },
    );
    if (avatar) embed.setImage(avatar);

    return {
      embeds: [embed.toJSON()],
    };
  }
}
