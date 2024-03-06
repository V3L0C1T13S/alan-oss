import { AttachmentBuilder } from "discord.js";
import { ErrorMessages } from "../../constants/index.js";
import {
  createGenerationManager, BaseCommand, CommandParameter, CommandParameterTypes,
} from "../../common/index.js";

const generationManager = createGenerationManager();

export default class Generate extends BaseCommand {
  static description = "Generate various media with AI.";
  static parameters: CommandParameter[] = [{
    name: "video",
    description: "Generate video from an image",
    type: CommandParameterTypes.Subcommand,
    subcommands: [{
      name: "attachment",
      description: "The attachment to generate a video for",
      type: CommandParameterTypes.Attachment,
    }],
  }, {
    name: "image",
    description: "Generate images from text",
    type: CommandParameterTypes.Subcommand,
    subcommands: [{
      name: "prompt",
      description: "The prompt to use for generation",
      type: CommandParameterTypes.String,
    }],
  }, {
    name: "music",
    description: "Generate music from text",
    type: CommandParameterTypes.Subcommand,
    subcommands: [{
      name: "prompt",
      description: "The prompt to use for generation",
      type: CommandParameterTypes.String,
    }],
  }];

  async run() {
    if (!this.args?.subcommands) return ErrorMessages.NotEnoughArgs;

    const { video, image, music } = this.args.subcommands;

    await this.ack();

    if (video) {
      const attachment = await this.getFirstAttachment();
      if (!attachment) return ErrorMessages.NotEnoughArgs;

      const result = await generationManager.generateVideo({
        inputImageURL: attachment.url,
      });
      if (!result.url && !result.data) return ErrorMessages.AIError;

      const mediaData = result.data ?? await (await fetch(`${result.url}`)).arrayBuffer();
      return {
        files: [new AttachmentBuilder(Buffer.from(mediaData))
          .setDescription("AI Generated video").setName("output.mp4")],
      };
    } if (image) {
      const { prompt } = this.args.subcommands;
      if (!prompt) return ErrorMessages.NotEnoughArgs;

      const result = await generationManager.generateImage({
        prompt: prompt.toString(),
      });
      if (!result.url && !result.data) return ErrorMessages.AIError;

      const mediaData = await fetch(`${result.url}`);
      return {
        files: [new AttachmentBuilder(Buffer.from(await mediaData.arrayBuffer()))
          .setDescription("AI Generated image").setName("output.png")],
      };
    } if (music) {
      const { prompt } = this.args.subcommands;
      if (!prompt) return ErrorMessages.NotEnoughArgs;

      const result = await generationManager.generateMusic({
        prompt: prompt.toString(),
      });

      if (!result.url && !result.data) return ErrorMessages.AIError;

      const mediaData = await fetch(`${result.url}`);
      return {
        files: [new AttachmentBuilder(Buffer.from(await mediaData.arrayBuffer()))
          .setDescription("AI Generated music").setName("output.wav")],
      };
    }

    return ErrorMessages.InvalidArgument;
  }
}
