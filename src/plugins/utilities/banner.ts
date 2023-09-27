import { CommandParameter, CommandParameterTypes, BaseCommand } from "../../common/index.js";

const BannerNotFound = "No banner found.";

export default class banner extends BaseCommand {
  async run() {
    const user = this.args?.users?.[0] ?? this.author;
    if (!user.banner) return BannerNotFound;

    return this.clientType === "revolt"
      ? `https://autumn.revolt.chat/backgrounds/${user.banner}`
      : user.bannerURL() ?? BannerNotFound;
  }

  static description = "Get your (or someone elses) banner URL";
  static parameters: CommandParameter[] = [{
    name: "user",
    description: "The user to get a banner from",
    type: CommandParameterTypes.User,
    optional: true,
  }];
}
