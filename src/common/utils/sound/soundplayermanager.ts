import { Client } from "discord.js";
import { ClientType } from "../../types/index.js";
import { SoundPlayer } from "./soundplayer.js";

export class SoundPlayerManager {
  private players: Map<ClientType, SoundPlayer> = new Map();

  createPlayer(client: Client, clientType: ClientType) {
    const player = new SoundPlayer(client);
    this.players.set(clientType, player);

    return player;
  }

  getPlayer(type: ClientType) {
    return this.players.get(type);
  }
}
