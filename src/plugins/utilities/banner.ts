import { Messages, revoltAutumnURL } from "../../constants/index.js";
import { CommandParameter, CommandParameterTypes, BaseCommand } from "../../common/index.js";

export default class banner extends BaseCommand {
  async run() {
    const user = this.args?.users?.[0] ?? this.author;
    if (!user.banner) return Messages.BannerNotFound;

    return this.clientType === "revolt"
      ? `${revoltAutumnURL}/backgrounds/${user.banner}`
      : user.bannerURL() ?? Messages.BannerNotFound;
  }

  static description = "Get your (or someone elses) banner URL";
  static parameters: CommandParameter[] = [{
    name: "user",
    description: "The user to get a banner from",
    type: CommandParameterTypes.User,
    optional: true,
  }];
}
