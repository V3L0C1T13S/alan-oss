import { Shoukaku, Connectors, NodeOption } from "shoukaku";
import { Client } from "discord.js";
import { Logger } from "../logger.js";

const Nodes: NodeOption[] = [{
  name: "localhost",
  url: "localhost:2333",
  auth: "nonelol",
}];

export class SoundPlayer {
  manager?: Shoukaku;
  connected = false;
  client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  connect() {
    this.manager = new Shoukaku(new Connectors.DiscordJS(this.client), Nodes, {
      moveOnDisconnect: true,
      resume: true,
      reconnectInterval: 500,
      reconnectTries: 1,
    });
    this.manager.on("error", (node, error) => Logger.error(`Error on node ${node}:`, error));
    this.manager.once("ready", () => {
      Logger.info(`Connected to ${this.manager?.nodes.size} Lavalink nodes`);
      this.connected = true;
    });
  }
}
