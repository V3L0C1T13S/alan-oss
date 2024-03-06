import {
  Shoukaku, Connectors, NodeOption, Player, Track, TrackExceptionEvent, LoadType,
} from "shoukaku";
import {
  Client, Guild, GuildMember, VoiceBasedChannel,
} from "discord.js";
import { Logger } from "../logger.js";
import { GenericReply } from "../../BaseCommand.js";

const Nodes: NodeOption[] = [{
  name: "localhost",
  url: "localhost:2333",
  auth: "youshallnotpass",
}];

export interface PlayOptions {
  guild: Guild,
  member: GuildMember,
}

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

  async play(soundURL: string, options: PlayOptions): Promise<GenericReply> {
    if (!this.connected) return "This instance has no lavalink nodes.";
    if (!this.manager) return "Shoukaku has not been initialized.";

    const voiceChannel = options.member.voice.channel;
    if (!voiceChannel) return "You must be in a channel for this to work!";

    const node = this.manager.nodes.get("localhost");
    if (!node) return "Couldn't get node.";

    const sound = await node.rest.resolve(soundURL).catch((e) => Logger.error(e));
    if (!sound || [LoadType.EMPTY, LoadType.ERROR].includes(sound.loadType)) return "Sound couldn't be downloaded.";

    const player = node.manager.players.get(voiceChannel.guildId)
      ?? await node.manager.joinVoiceChannel({
        guildId: voiceChannel.guildId,
        channelId: voiceChannel.id,
        shardId: voiceChannel.guild.shardId,
        deaf: true,
      });
    const track = sound.loadType === LoadType.TRACK
      ? sound.data
      : sound.loadType === LoadType.PLAYLIST
        ? sound.data.tracks[0]
        : undefined;
    if (!track) return "No tracks.";

    await this.nextSong(options, player, track, voiceChannel);

    return "OK.";
  }

  async nextSong(options: PlayOptions, player: Player, track: Track, channel: VoiceBasedChannel) {
    const parts = Math.floor((0 / track.info.length) * 10);

    this.removePlayerListeners(player);
    await player.playTrack({
      track: track.encoded,
    });

    player.once("exception", (e) => this.onError(e, player, channel));
    player.once("stuck", async () => {
      const nodeName = this.manager?.nodes.get("localhost")?.name;
      if (!nodeName) return;
      await player.move(nodeName);
      await player.resume();
    });
    player.on("end", async (data) => {
      if (data.reason === "replaced") return;

      await player.node.manager.leaveVoiceChannel(options.guild.id);
    });
  }

  private async onError(error: TrackExceptionEvent, player: Player, channel: VoiceBasedChannel) {
    try {
      await player.node.manager.leaveVoiceChannel(channel.guildId);
    } catch (e) {
      // noop
    }
    this.removePlayerListeners(player);
  }

  private removePlayerListeners(player: Player) {
    player.removeAllListeners("exception");
    player.removeAllListeners("stuck");
    player.removeAllListeners("end");
  }
}
