import { ErrorMessages } from "../../constants/index.js";
import { BaseCommand, CommandParameter, CommandParameterTypes } from "../../common/index.js";

export default class Hubchicken extends BaseCommand {
  static imageArray: Record<string, string> = {};
  static videoArray: Record<string, string> = {};

  static description = "hubchicken will be real in 2283.";
  static parameters: CommandParameter[] = [{
    name: "image",
    description: "Grab an image from hubchicken.",
    type: CommandParameterTypes.Subcommand,
    subcommands: [],
  }, {
    name: "video",
    description: "Grab a video from hubchicken.",
    type: CommandParameterTypes.Subcommand,
    subcommands: [],
  }];

  private getRandomInRecord(record: Record<string, string>) {
    const arr = Object.values(record);
    const value = arr[Math.floor(Math.random() * arr.length)];

    return value;
  }

  async run() {
    if (!this.args?.subcommands) return ErrorMessages.NotEnoughArgs;

    const { image, video } = this.args.subcommands;

    if (image) {
      const randomImage = this.getRandomInRecord(Hubchicken.imageArray);

      if (!randomImage) return "No image.";

      return randomImage;
    }
    if (video) {
      const randomVideo = this.getRandomInRecord(Hubchicken.videoArray);

      if (!randomVideo) return "No video.";

      return randomVideo;
    }

    return "real";
  }

  static async init() {
    this.imageArray = (await (await fetch("https://cdn.hubchicken.tk/image-array.json")).json()) as Record<string, string>;
    this.videoArray = (await (await fetch("https://videos.hubchicken.tk/video-array.json")).json()) as Record<string, string>;

    return this;
  }
}
