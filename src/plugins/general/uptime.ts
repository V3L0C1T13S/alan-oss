import { BaseCommand } from "../../common/index.js";

export default class Uptime extends BaseCommand {
  static description = "Returns the uptime of the bot";

  async run() {
    if (!this.client.uptime) return "No uptime?";

    const uptime = new Date(this.client.uptime);
    const hours = uptime.getHours();
    const minutes = uptime.getMinutes();
    const seconds = uptime.getSeconds();

    return `Uptime:${hours ? ` ${hours} hours` : ""}${minutes ? `, ${minutes} minutes` : ""}${seconds ? `, ${seconds} seconds` : ""}`;
  }
}
