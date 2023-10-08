import { ErrorMessages, revoltAutumnURL } from "../../constants/index.js";
import { BaseCommand, CommandParameter, CommandParameterTypes } from "../../common/index.js";

export default class avatar extends BaseCommand {
  async run() {
    const user = this.args?.users?.[0] ?? this.author;
    if (!user.avatar) return ErrorMessages.AvatarNotFound;

    if (this.args?.subcommands?.server) {
      const member = await this.guild?.members.fetch(user);
      if (member?.avatar) {
        return this.clientType === "revolt"
          ? `${revoltAutumnURL}/avatars/${member.avatar}`
          : member.avatarURL() ?? ErrorMessages.AvatarNotFound;
      }
    }

    if (!user.avatar) return ErrorMessages.AvatarNotFound;

    return this.clientType === "revolt"
      ? `${revoltAutumnURL}/avatars/${user.avatar}`
      : user.avatarURL() ?? ErrorMessages.AvatarNotFound;
  }

  static description = "Get your own (or someone elses) avatar URL";
  static parameters: CommandParameter[] = [{
    name: "user",
    description: "The user to get the avatar of.",
    type: CommandParameterTypes.User,
    optional: true,
  }, {
    name: "server",
    description: "Get the users server avatar.",
    type: CommandParameterTypes.Bool,
    optional: true,
  }];
}
