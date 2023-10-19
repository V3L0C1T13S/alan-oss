import { Messages } from "../../constants/index.js";
import {
  CommandParameter, CommandParameterTypes, BaseCommand, getUserBannerURL,
} from "../../common/index.js";

export default class banner extends BaseCommand {
  async run() {
    const user = this.args?.users?.[0] ?? this.author;

    return getUserBannerURL(user, this.clientType) ?? Messages.BannerNotFound;
  }

  static description = "Get your (or someone elses) banner URL";
  static parameters: CommandParameter[] = [{
    name: "user",
    description: "The user to get a banner from",
    type: CommandParameterTypes.User,
    optional: true,
  }];
}
