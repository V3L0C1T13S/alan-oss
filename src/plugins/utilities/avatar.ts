import { Messages } from "../../constants/index.js";
import {
  BaseCommand, CommandParameter, CommandParameterTypes, getUserAvatarURL,
} from "../../common/index.js";

export default class avatar extends BaseCommand {
  async run() {
    const user = this.args?.users?.[0] ?? this.author;
    const target = this.args?.subcommands?.server && this.guild
      ? await this.guild.members.fetch(user)
      : user;

    return getUserAvatarURL(target, this.clientType) ?? Messages.AvatarNotFound;
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
