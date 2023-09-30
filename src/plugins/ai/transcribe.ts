import path from "node:path";
import { nodewhisper } from "nodejs-whisper";
import { AttachmentBuilder } from "discord.js";
import { mkdir, writeFile } from "node:fs/promises";
import { fileTypeFromBuffer } from "file-type";
import {
  BaseCommand, CommandParameter, CommandParameterTypes, MessageFormatter,
} from "../../common/index.js";
import {
  ErrorMessages, Messages, alanTmpDir, revoltAutumnURL, revoltJanuaryURL,
} from "../../constants/index.js";

const dirPath = path.join(alanTmpDir, "audio");
const MaxMessageLength = 1500;

const supportedTypes = ["audio", "video"];

export default class Transcribe extends BaseCommand {
  async run() {
    const attachment = await this.getFirstAttachment();
    if (!attachment) return ErrorMessages.NeedsAudioOrVideo;

    await this.ack();

    // quick precheck
    if (attachment.type && !supportedTypes.some((type) => attachment.type?.startsWith(type))) {
      return MessageFormatter.UnsupportedContentType(supportedTypes, attachment.type);
    }

    const proxiedURL = attachment.url.startsWith("https://cdn.discordapp.com")
    || attachment.url.startsWith("https://media.discordapp.net")
    || attachment.url.startsWith(revoltAutumnURL)
    || attachment.url.startsWith(revoltJanuaryURL)
      ? attachment.url
      : attachment.proxy_url;
    if (!proxiedURL) return ErrorMessages.UnproxiedAttachment;

    const filePath = path.join(dirPath, attachment.discord_id ?? attachment.id);
    const response = await fetch(proxiedURL);
    const buffer = Buffer.from(await response.arrayBuffer());

    const mimeType = await fileTypeFromBuffer(buffer);
    if (!mimeType) return ErrorMessages.UndetectableMimeType;

    if (!supportedTypes.some((type) => mimeType.mime.startsWith(type))) {
      return MessageFormatter.UnsupportedContentType(supportedTypes, mimeType.mime);
    }

    await mkdir(dirPath, { recursive: true });
    await writeFile(filePath, buffer);

    const transcript = (await nodewhisper(filePath, {
      modelName: "base.en",
      autoDownloadModelName: "base.en",
    }));

    if (!transcript?.length) return Messages.NoSpeechDetected;

    const attachments: AttachmentBuilder[] = [];

    if (transcript.length > MaxMessageLength) {
      const transcriptAttachment = new AttachmentBuilder(Buffer.from(transcript, "utf-8"));
      transcriptAttachment.setName("transcript.txt");

      attachments.push(transcriptAttachment);
    }

    return attachments.length ? {
      content: "Here's your transcript!",
      files: attachments,
    } : transcript;
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
  }];
}
