import { BaseCommand } from "../../common/index.js";

export default class serverInfo extends BaseCommand {
  async run() {
    if (!this.guild) return "This channel has no server associated.";
    return `server name: ${this.guild.name}
server id: ${this.guild.id}
current channel: ${this.channel?.id}
channel type: ${this.channel?.type}`;
  }
}
