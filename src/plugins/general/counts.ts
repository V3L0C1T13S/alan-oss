import { BaseCommand } from "../../common/index.js";

export default class counts extends BaseCommand {
  async run() {
    return {
      content: `${JSON.stringify(await this.bot.database.getCounts())}`,
    };
  }

  static description = "yes";
}
