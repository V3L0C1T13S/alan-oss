import { AttachmentBuilder, EmbedAuthorOptions, EmbedBuilder } from "discord.js";
import { ErrorMessages } from "../../constants/index.js";
import {
  BaseCommand, CommandParameter, CommandParameterTypes, createMusicIdentifier,
} from "../../common/index.js";

const musicIdentifier = createMusicIdentifier();

export default class Identify extends BaseCommand {
  static description = "Find the source for music or video.";
  static parameters: CommandParameter[] = [{
    name: "url",
    description: "The URL to the resource.",
    type: CommandParameterTypes.String,
    optional: true,
  }, {
    name: "attachment",
    description: "Attachment to find the source of. Supports audio or video.",
    type: CommandParameterTypes.Attachment,
    optional: true,
  }];

  async run() {
    const url = (await this.getFirstAttachment())?.url ?? this.joinArgsToString();
    if (!url) return ErrorMessages.NotEnoughArgs;

    await this.ack();

    try {
      const result = await musicIdentifier.find(url);
      const embed = new EmbedBuilder()
        .setTitle(result.title);

      const artwork = result.artwork_url;
      const bgColor = result.bg_color;
      const artistURL = result.artist_url;
      const artistIcon = result.artist_icon;

      const author: EmbedAuthorOptions = {
        name: result.artist,
      };
      if (artistURL) author.url = artistURL;
      if (artistIcon) author.iconURL = artistIcon;
      if (artwork) embed.setThumbnail(artwork);
      embed.setAuthor(author);
      if (result.links.length) embed.setDescription(result.links.map((link) => `[${link.name}](${link.url})`).join(", "));
      else embed.setDescription("No links found.");

      if (bgColor) embed.setColor(`#${bgColor}`);
      if (result.album) {
        embed.addFields({
          name: "Album",
          value: result.album,
          inline: true,
        });
      }
      if (result.release_date) {
        embed.addFields({
          name: "Release Date",
          value: result.release_date,
          inline: true,
        });
      }
      if (result.timecode) {
        embed.addFields({
          name: "Timecode",
          value: result.timecode,
          inline: true,
        });
      }

      const files: AttachmentBuilder[] = [];
      if (result.preview_url) {
        const previewResponse = await fetch(result.preview_url);
        const previewBuffer = Buffer.from(await previewResponse.arrayBuffer());
        files.push(new AttachmentBuilder(previewBuffer).setName("preview.m4a"));
      }

      return {
        embeds: [embed.toJSON()],
        files,
      };
    } catch (e) {
      return "Song could not be identified.";
    }
  }
}
