import { BaseCommand } from "../../common/index.js";

export default class play extends BaseCommand {
  async run() {
    if (!this.channel || !this.guild) return "nah";

    return "Ok";
  }
}
