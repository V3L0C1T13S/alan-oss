import { ErrorMessages } from "../../constants/index.js";
import { BaseCommand, CommandParameter, CommandParameterTypes } from "../../common/index.js";

export default class avatar extends BaseCommand {
  async run() {
    const user = this.args?.users?.[0] ?? this.author;
    if (!user.avatar) return ErrorMessages.AvatarNotFound;

    return this.clientType === "revolt"
      ? `https://autumn.revolt.chat/avatars/${user.avatar}`
      : user.avatarURL() ?? ErrorMessages.AvatarNotFound;
  }

  static description = "Get your (or someone elses) avatar URL";
  static parameters: CommandParameter[] = [{
    name: "user",
    description: "The user to get the avatar of.",
    type: CommandParameterTypes.User,
    optional: true,
  }];
}
