import os from "node:os";
import path from "node:path";
import { mkdirSync, writeFileSync } from "node:fs";
import { nodewhisper } from "nodejs-whisper";
import { AttachmentBuilder } from "discord.js";
import { BaseCommand, CommandParameter, CommandParameterTypes } from "../../common/index.js";
import { Messages } from "../../constants/index.js";

const dirPath = path.join(os.tmpdir(), "alan-tmp/audio");
const MaxMessageLength = 1500;

export default class Transcribe extends BaseCommand {
  async run() {
    const attachment = this.attachments?.first();
    if (!attachment) return "Please attach audio or video.";

    await this.ack();

    const url = attachment?.url;
    const filePath = path.join(dirPath, attachment.id);
    const buffer = await fetch(url);

    mkdirSync(dirPath, { recursive: true });
    writeFileSync(filePath, Buffer.from(await buffer.arrayBuffer()), { });

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
    optional: false,
  }, {
    name: "url",
    description: "The URL to an attachment to transcribe. Must be valid x-audio or x-video.",
    type: CommandParameterTypes.String,
    optional: true,
  }];
}
