import { Messages } from "../../constants/index.js";
import { BaseCommand } from "../../common/index.js";

export default class Skip extends BaseCommand {
  static description = "Skip some tunes!";

  async run() {
    const player = this.bot.soundPlayerManager.getPlayer(this.clientType);
    if (!player) return "No player.";
    if (!this.guild) return "No guild.";

    const member = await this.guild.members.fetch(this.author);

    return Messages.Unimplemented;
  }
}
