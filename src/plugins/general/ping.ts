import { BaseCommand } from "../../common/index.js";

export default class Ping extends BaseCommand {
  async run() {
    return `WS ping: ${this.client.ws.ping}`;
  }

  static description = "Returns the ping of the bot";
}
