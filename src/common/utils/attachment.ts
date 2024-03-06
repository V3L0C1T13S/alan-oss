import { Channel, Interaction, Message } from "discord.js";
import { ulid } from "ulid";
import { GenericAttachment } from "../BaseCommand.js";

type attachmentOptions = {
  channel?: Channel | undefined | null
} & ({
    message: Message;
} | {
    interaction: Interaction;
});

async function selectMessage(options: attachmentOptions) {
  return "message" in options
    ? (options.message?.reference ? options.message.fetchReference() : options.message)
    : options.channel?.isTextBased()
      ? (await options.channel.messages.fetch())
        .filter((x) => x.attachments.size)
        .first()
      : undefined;
}

export async function extractAttachments(options: attachmentOptions) {
  const message = await selectMessage(options);

  return message?.attachments ?? ("interaction" in options && options.interaction.isChatInputCommand()
    ? options.interaction.options.resolved?.attachments
    : undefined);
}

export async function getFirstAttachment(
  options: attachmentOptions,
): Promise<GenericAttachment | undefined> {
  const id = ulid();
  const message = await selectMessage(options);
  const attachments = await extractAttachments(options);
  // our attachments or reply attachments first
  const attachment = attachments?.first() ?? message?.attachments.first();

  if (attachment) {
    return {
      discord_id: attachment.id,
      id,
      url: attachment.url,
      proxy_url: attachment.proxyURL,
      type: attachment.contentType,
    };
  }

  if (message) {
    // TODO (revolt): this wont work because revolt does a late update for embeds
    if (message.embeds[0]) {
      const embed = message.embeds[0];

      if (embed.video && embed.video.proxyURL) {
        return {
          id,
          url: embed.video.url,
          proxy_url: embed.video.proxyURL,
          type: "video",
        };
      }
      if (embed.image && embed.image.proxyURL) {
        return {
          id,
          url: embed.image.url,
          proxy_url: embed.image.proxyURL,
          type: "image",
        };
      }
      if (embed.thumbnail && embed.thumbnail.proxyURL) {
        return {
          id,
          url: embed.thumbnail.url,
          proxy_url: embed.thumbnail.proxyURL,
          type: "image",
        };
      }
    }
  }

  return;
}
