import { ErrorMessages } from "../../constants/index.js";
import { BaseCommand, CommandParameter, CommandParameterTypes } from "../../common/index.js";

export default class Play extends BaseCommand {
  static description = "Play some tunes!";
  static parameters: CommandParameter[] = [{
    name: "url",
    description: "A URL to the music.",
    type: CommandParameterTypes.String,
    optional: false,
  }];

  async run() {
    const soundURL = (await this.getFirstAttachment())?.url ?? this.joinArgsToString();
    if (!soundURL) return ErrorMessages.NotEnoughArgs;

    const player = this.bot.soundPlayerManager.getPlayer(this.clientType);
    if (!player) return "No player.";
    if (!this.guild) return "No guild.";

    const member = await this.guild.members.fetch(this.author);

    return player.play(soundURL, {
      guild: this.guild,
      member,
    });
  }
}
