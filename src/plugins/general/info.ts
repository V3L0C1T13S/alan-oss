import { EmbedBuilder } from "discord.js";
import { BaseCommand, getReflectcordInstanceInfo } from "../../common/index.js";
import { discordOwnerId, revoltOwnerId } from "../../constants/index.js";

export default class info extends BaseCommand {
  async run() {
    const reflectcordInfo = this.clientType === "revolt" ? await getReflectcordInstanceInfo() : null;
    // eslint-disable-next-line no-nested-ternary
    const owner = this.clientType === "revolt" && revoltOwnerId
      ? await this.client.users.fetch(revoltOwnerId)
      : this.clientType === "discord" && discordOwnerId
        ? await this.client.users.fetch(discordOwnerId)
        : null;

    const embed = new EmbedBuilder();

    embed.setAuthor({
      name: "Info",
    });
    if (this.client.user?.avatar && embed.data.author) {
      embed.data.author.icon_url = this.clientType === "revolt"
        ? `https://autumn.revolt.chat/avatars/${this.client.user.avatar}`
        : this.client.user.avatarURL()!;
    }
    if (owner) embed.setDescription(`This instance is hosted by **${owner.username}#${owner.discriminator}** on ${this.clientType}`);
    else embed.setDescription("This instance has no owner. Tell the owner to set his .env correctly!");

    embed.setFields({
      name: "Server count",
      value: `${this.client.guilds.cache.size}`,
    }, {
      name: "Source code",
      value: "[Click here!](https://github.com/V3L0C1T13S/alan-oss)",
    }, {
      name: "Backend",
      value: `This instance is running on ${this.clientType === "revolt" ? `Revolt via [Reflectcord](https://github.com/V3L0C1T13S/reflectcord) (Revolt v${reflectcordInfo?.revolt.revolt})` : "Discord"}`,
    });

    return {
      embeds: [embed.toJSON()],
    };
  }

  static description = "Get info about this instance";
}
