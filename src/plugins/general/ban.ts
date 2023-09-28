import { BaseCommand, CommandParameter, CommandParameterTypes } from "../../common/index.js";

export default class ban extends BaseCommand {
  static description = "Ban a user from the server";
  static parameters: CommandParameter[] = [{
    name: "user",
    type: CommandParameterTypes.User,
    description: "The user to ban",
  }, {
    name: "reason",
    type: CommandParameterTypes.String,
    description: "The reason to ban the user for",
    optional: true,
  }];
}
