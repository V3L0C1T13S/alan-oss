import {
  AttachmentBuilder,
  EmbedAuthorOptions,
  EmbedBuilder,
  MessageFlags,
  MessageType,
  RESTPostAPIChannelMessageJSONBody,
} from "discord.js";
import { fileTypeFromBuffer } from "file-type";
import { ErrorMessages, useVoiceMessageAudio } from "../../constants/index.js";
import {
  BaseCommand, CommandParameter, CommandParameterTypes, Logger, createMusicIdentifier,
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
      let previewBuffer: Buffer | undefined;
      if (result.preview_url) {
        try {
          const previewResponse = await fetch(result.preview_url);
          previewBuffer = Buffer.from(await previewResponse.arrayBuffer());
          files.push(new AttachmentBuilder(previewBuffer).setName("preview.m4a"));
        } catch (e) {
          Logger.error("Failed to fetch music preview:", e);
        }
      }

      if (previewBuffer && useVoiceMessageAudio) {
        try {
          const data: RESTPostAPIChannelMessageJSONBody = {
            content: "",
            channel_id: this.channel!.id,
            flags: MessageFlags.IsVoiceMessage,
            type: MessageType.Default,
            attachments: [{
              id: "0",
              filename: "preview.m4a",
              // @ts-ignore
              duration_secs: 30,
              // FIXME: this is the waveform for "you give love a bad name" lol
              waveform: "qne1loetqp6qqqKmprGipq2Srbmejp7YquCtsdy5vcWx0MzBxcjMwcy5yNS1xeDI0J614MzQ1LnU1MXBwdDI1LHM0L3YyLXguczFvdTMjqpzc3M2c3NzOXN3OXdzOXNzcEFzcD1zc3t3c5pJd55Bg4s9mnd/mnOaf3eeLgB/0Mzg463B77H3vbnc4MzzxczgzOPgzMXQtdTn3ODcyMzn2NTB4+/Y/9TM4PPj49jF9+vg89jc69jn6+Dc79D34NjjplVYzMWL4MHMsZKirczMor2mzNTB1IOmkofQvffgudTgxf/IxeDM5+fFyNzY5+OxzNCW0Kqm0Lm9zLXBrQAAAA==",
            }],
          };
          const mimeType = (await fileTypeFromBuffer(previewBuffer))?.mime ?? "application/octet-stream";
          const formData = new FormData();
          formData.append("files[0]", new Blob([previewBuffer], { type: mimeType }), "preview.m4a");
          formData.append("payload_json", JSON.stringify(data));

          await this.client.rest.post(`/channels/${this.channel!.id}/messages`, {
            body: formData,
            passThroughBody: true,
          });
        } catch (e) {
          Logger.error("Failed to upload voice message preview:", e);
        }

        return {
          embeds: [embed.toJSON()],
        };
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
