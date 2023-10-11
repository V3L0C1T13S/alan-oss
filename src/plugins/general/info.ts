import { EmbedAuthorOptions, EmbedBuilder } from "discord.js";
import os from "node:os";
import { BaseCommand, getReflectcordInstanceInfo, getUserAvatarURL } from "../../common/index.js";
import { discordOwnerId, revoltOwnerId } from "../../constants/index.js";

export default class info extends BaseCommand {
  async run() {
    await this.ack();
    const reflectcordInfo = this.clientType === "revolt" ? await getReflectcordInstanceInfo() : null;
    // eslint-disable-next-line no-nested-ternary
    const owner = this.clientType === "revolt" && revoltOwnerId
      ? await this.client.users.fetch(revoltOwnerId)
      : this.clientType === "discord" && discordOwnerId
        ? await this.client.users.fetch(discordOwnerId)
        : null;

    const embed = new EmbedBuilder()
      .setTitle("Info");

    const authorOptions: EmbedAuthorOptions = {
      name: this.client.user?.username ?? "Info",
    };
    const avatarURL = getUserAvatarURL(this.client.user!, this.clientType);
    if (avatarURL) {
      authorOptions.iconURL = avatarURL;
    }
    embed.setAuthor(authorOptions);

    if (owner) embed.setDescription(`This instance is hosted by **${owner.username}${owner.discriminator !== "0" ? `#${owner.discriminator}` : ""}** on ${this.clientType}`);
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
    }, {
      name: "Host",
      value: `${os.type()} ${os.release()} (${os.arch()})`,
    });

    return {
      embeds: [embed.toJSON()],
    };
  }

  static description = "Get info about this instance";
}
