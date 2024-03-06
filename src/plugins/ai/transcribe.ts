import { AttachmentBuilder } from "discord.js";
import { fileTypeFromBuffer } from "file-type";
import {
  BaseCommand,
  CommandParameter,
  CommandParameterTypes,
  MessageFormatter,
  VoiceRecognitionCapabilities,
} from "../../common/index.js";
import {
  ErrorMessages, supportedTranscribeTypes, revoltAutumnURL, revoltJanuaryURL, maxMessageLength,
} from "../../constants/index.js";

export default class Transcribe extends BaseCommand {
  async run() {
    const attachment = await this.getFirstAttachment();
    const translate = !!this.args?.subcommands?.translate;

    if (translate
      && !this.bot.voiceRecognitionManager.capabilities
        .includes(VoiceRecognitionCapabilities.Translation)) {
      return MessageFormatter.UnsupportedCapability(
        VoiceRecognitionCapabilities.Translation.toString(),
      );
    }

    if (!attachment) return ErrorMessages.NeedsAudioOrVideo;

    await this.ack();

    // quick precheck
    if (attachment.type && !supportedTranscribeTypes
      .some((type) => attachment.type?.startsWith(type))) {
      return MessageFormatter.UnsupportedContentType(supportedTranscribeTypes, attachment.type);
    }

    const proxiedURL = attachment.url.startsWith("https://cdn.discordapp.com")
    || attachment.url.startsWith("https://media.discordapp.net")
    || attachment.url.startsWith(revoltAutumnURL)
    || attachment.url.startsWith(revoltJanuaryURL)
      ? attachment.url
      : attachment.proxy_url;
    if (!proxiedURL) return ErrorMessages.UnproxiedAttachment;

    const response = await fetch(proxiedURL);
    const buffer = Buffer.from(await response.arrayBuffer());

    const mimeType = await fileTypeFromBuffer(buffer);
    if (!mimeType) return ErrorMessages.UndetectableMimeType;

    if (!supportedTranscribeTypes.some((type) => mimeType.mime.startsWith(type))) {
      return MessageFormatter.UnsupportedContentType(supportedTranscribeTypes, mimeType.mime);
    }

    const transcript = await this.bot.voiceRecognitionManager.transcribe({
      data: buffer,
      hints: {
        auto_translate: translate,
      },
    });

    const attachments: AttachmentBuilder[] = [];

    if (transcript.content.length > maxMessageLength) {
      const transcriptAttachment = new AttachmentBuilder(Buffer.from(transcript.content, "utf-8"));
      transcriptAttachment.setName("transcript.txt");

      attachments.push(transcriptAttachment);
    }

    return attachments.length ? {
      content: "Here's your transcript!",
      files: attachments,
    } : transcript.content;
  }

  static description = "Transcribe audio or video.";
  static parameters: CommandParameter[] = [{
    name: "attachment",
    description: "The attachment to transcribe. Must be valid x-audio or x-video.",
    type: CommandParameterTypes.Attachment,
    optional: true,
  }, {
    name: "url",
    description: "The URL to an attachment to transcribe. Must be valid x-audio or x-video.",
    type: CommandParameterTypes.String,
    optional: true,
  }, {
    name: "translate",
    description: "Translate the output.",
    type: CommandParameterTypes.Bool,
    optional: true,
  }];
}
