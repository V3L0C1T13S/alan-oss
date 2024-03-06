import {
  EndBehaviorType,
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  VoiceConnectionStatus,
  entersState,
  VoiceConnection,
} from "@discordjs/voice";
import { opus } from "prism-media";
import { createWriteStream } from "fs";
import path from "path";
import { ulid } from "ulid";
import child from "node:child_process";
import util from "node:util";
import { rm } from "node:fs/promises";
import { sample } from "lodash-es";
import { Readable } from "stream";
import { ErrorMessages, alanTmpDir } from "../../constants/index.js";
import {
  BaseCommand, CommandParameter, CommandParameterTypes, Logger,
} from "../../common/index.js";

const exec = util.promisify(child.exec);

const maxNoiseStrikes = 8;
const alanAudioTmpDir = path.join(alanTmpDir, "audio");
const voiceActivationTimeout = 2; // timeout before we stop listening to the user

const voiceActivationSound = createAudioResource("./resources/audio/voice_activation.mp3");

const sentenceEnders = [".", "!", "?", "..."];
const concatSentenceEndings = (triggers: string[]) => triggers.flatMap((x) => [x, ...sentenceEnders.map((y) => `${x}${y}`)]);
const createTriggerMap = (prefixes: string[], triggers: string[]) => {
  const prefixVars = prefixes.flatMap((x) => [x, `- ${x}`]);
  const triggerVars = concatSentenceEndings(triggers);
  const triggerMap = prefixVars.flatMap((x) => triggerVars.flatMap((y) => [`${x} ${y}`, `${x}, ${y}`]));

  return triggerMap;
};

const containsTrigger = (text: string, triggers: string[]) => triggers
  .some((x) => text === x);

const aiTriggerWords = ["assistant", "alan", "ailsa", "elsa", "ellen", "allen"];
const aiPrefixTriggers = ["hello", "hey", "hi", "ok", "yo", "listen", "what's good", "what's up"]
  .map((x) => [x, `- ${x}`]).flat();
const voiceActivationTriggers = createTriggerMap(aiPrefixTriggers, aiTriggerWords);
const disconnectTriggerPrefixes = ["disconnect", "leave", "go away"];
const disconnectTriggers = disconnectTriggerPrefixes
  .concat(
    createTriggerMap(aiTriggerWords, disconnectTriggerPrefixes),
    concatSentenceEndings(disconnectTriggerPrefixes),
  );

Logger.debug("Disconnect triggers:", disconnectTriggers);

// TODO: use these based on detected user personality
const goodbyeMessages = ["Goodbye.", "Let's talk again sometime.", "Have a nice day!", "Cya!", "Cya later."];

class LivetalkParticipant {
  id: string;
  participating: boolean;

  private noise_strikes = 0;
  private warn_count = 0;

  private timeout_end_date?: Date;

  constructor(id: string, participating: boolean) {
    this.id = id;
    this.participating = participating;
  }

  addStrike() {
    this.noise_strikes += 1;

    Logger.debug(`New strike count for ${this.id}:`, this.noise_strikes);
  }

  warn() {
    this.warn_count += 1;
  }

  hasBeenWarned() {
    return this.warn_count > 0;
  }

  isNearMaxStrikes() {
    return !!this.noise_strikes && this.noise_strikes >= maxNoiseStrikes / 2;
  }

  timeout() {
    const date = new Date();
    // 5 minute mute
    date.setMinutes(date.getMinutes() + 5);

    this.timeout_end_date = date;

    Logger.debug(`Timed out ${this.id} until ${date.toLocaleString()}`);
  }

  isTimedOut() {
    if (!this.timeout_end_date) return false;

    const currentTime = Date.now();
    return currentTime < this.timeout_end_date?.valueOf();
  }
}

enum LivetalkSessionCommand {
  Stop
}

class LivetalkSession {
  private readonly owner: string;
  private readonly users = new Map<string, LivetalkParticipant>();
  private readonly connection: VoiceConnection;

  constructor(users: string[], owner: string, connection: VoiceConnection) {
    users.forEach((x) => this.addUser(x));

    this.owner = owner;
    this.connection = connection;
  }

  addUser(userId: string) {
    if (this.getUser(userId)) throw new Error(`User ${userId} already exists.`);

    this.users.set(userId, new LivetalkParticipant(userId, true));
  }

  removeUser(userId: string) {
    this.users.delete(userId);
  }

  getUser(userId: string) {
    return this.users.get(userId);
  }

  setUserParticipation(userId: string, participating: boolean) {
    const user = this.getUser(userId);
    if (!user) throw new Error(`User ${userId} is not part of this session.`);

    user.participating = participating;
  }

  shouldListen(userId: string) {
    const user = this.getUser(userId);

    return user?.participating && !user?.isTimedOut();
  }

  async runCommand(command: LivetalkSessionCommand, userId: string) {
    if (command === LivetalkSessionCommand.Stop) {
      if (userId !== this.owner) return `I'm sorry <@${userId}>, I can only be told to leave by the session creator. If you feel I am being annoying, you may mute me by using your clients built-in mute feature. If you'd like to opt out of me listening to you, you may run \`/livetalk optout\`. You may also ask a server admin to disconnect me by using the disconnect button.`;

      this.stop();
      return `Session stopped. ${sample(goodbyeMessages)}`;
    }

    return "Unknown command.";
  }

  stop() {
    this.connection.destroy();
  }
}

const sessions = new Map<string, LivetalkSession>();

export default class LiveTalk extends BaseCommand {
  static description = "Talk to the AI in realtime.";
  static private = true;
  static parameters: CommandParameter[] = [{
    name: "start",
    description: "Start a new livetalk session.",
    type: CommandParameterTypes.Subcommand,
    subcommands: [{
      name: "ai",
      description: "Use AI for this session.",
      type: CommandParameterTypes.Bool,
    }, {
      name: "attentive",
      description: "Always listen for your voice, even if you don't mention the AI's name.",
      type: CommandParameterTypes.Bool,
      optional: true,
    }],
  }, {
    name: "optout",
    description: "Opt-out of livetalk sessions.",
    type: CommandParameterTypes.Subcommand,
    subcommands: [],
  }, {
    name: "optin",
    description: "Participate in livetalk sessions again.",
    type: CommandParameterTypes.Subcommand,
    subcommands: [],
  }, {
    name: "stop",
    description: "Stop the current livetalk session.",
    type: CommandParameterTypes.Subcommand,
    subcommands: [],
  }];

  async run() {
    await this.ack();

    if (!this.args?.subcommands) return ErrorMessages.NotEnoughArgs;
    const {
      start, stop, optout, optin, attentive,
    } = this.args.subcommands;

    const member = await this.guild?.members.fetch(this.author);
    if (!member) return "You must be in a server to use this command.";

    const voiceChannel = member.voice.channel;
    if (!voiceChannel) return "You must be connected to a voice channel to use this command.";

    const existingSession = sessions.get(voiceChannel.id);
    if (stop) {
      if (!existingSession) return ErrorMessages.NoLiveTalkSession;

      return existingSession.runCommand(LivetalkSessionCommand.Stop, this.author.id);
    }
    if (optin) {
      existingSession?.setUserParticipation(this.author.id, true);
      return "Opted in.";
    }
    if (optout) {
      existingSession?.setUserParticipation(this.author.id, false);
      return "Opted out.";
    }

    // start
    if (existingSession) return ErrorMessages.LivetalkSessionAlreadyActive;
    if (!voiceChannel.joinable) return ErrorMessages.NoPermissionToJoinVoiceChannel;

    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guildId,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
      selfDeaf: false,
      selfMute: false,
    });

    const session = new LivetalkSession(voiceChannel.members
      .map((x) => x.id), this.author.id, connection);
    sessions.set(voiceChannel.id, session);
    const voiceActivationTimes = new Map<string, Date>();

    connection.receiver.speaking.on("start", async (userId) => {
      try {
        if (!session.shouldListen(userId)) return;

        const sessionUser = session.getUser(userId);
        if (sessionUser?.isNearMaxStrikes() && !sessionUser.hasBeenWarned()) {
          await this.followUp(`# Hey there, <@${userId}>\nYour microphone appears to be buggy, and is causing our systems to get all mixed up.\nYou may want to try turning on Krisp Noise Suppression, Echo Cancellation, Push To Talk, adjusting Gain Control, and other options that can help suppress noise.\nOur systems are pretty good at filtering out noise on their own, but it isn't magic. **If you do not fix your microphone, you will be temporarily ignored by our voice recognition systems to prevent further stress.**\n\n## If all else fails...\nIt may be time to consider buying a new microphone. We recommend a microphone with **at least** 41KHz sound quality and dual channel audio.`);
          sessionUser.warn();
        }

        const started = Date.now();
        const activatedAt = voiceActivationTimes.get(userId)?.valueOf();
        const listening = activatedAt ? started - activatedAt <= voiceActivationTimeout : false;

        const subscription = connection.receiver.subscribe(userId, {
          end: {
            behavior: EndBehaviorType.AfterSilence,
            duration: listening ? 1200 : 600, // more interested in users actively engaging with us
          },
        });

        const fileId = ulid();
        const pcmFilePath = path.join(alanAudioTmpDir, `${fileId}.pcm`);
        const mp3FilePath = path.join(alanAudioTmpDir, `${fileId}.mp3`);
        const decoder = new opus.Decoder({
          frameSize: 960,
          channels: 2,
          rate: 48000,
        });
        const stream = subscription.pipe(decoder).pipe(createWriteStream(pcmFilePath));

        stream.on("finish", async () => {
          try {
          // TODO: use ffmpeg package to support systems without ffmpeg as global command
            await exec(`ffmpeg -y -f s16le -ar 48k -ac 2 -i ${pcmFilePath} ${mp3FilePath}`);
            const transcript = await this.bot.voiceRecognitionManager
              .transcribe({
                path: mp3FilePath,
                hints: {
                  mode: "fast",
                },
              });
            Logger.debug("Transcript:", transcript);

            const conversation = await this.bot.aiManager
              .getOrCreateCurrentConversation((await this.getDbUser()).id);
            const hasAiTriggerWord = aiTriggerWords
              .some((x) => transcript.content.toLowerCase().includes(x));
            const user = await this.client.users.fetch(userId);

            if ((this.args?.subcommands?.ai && hasAiTriggerWord)
            || listening
            || (attentive && userId === this.author.id)
            ) {
              const useVoiceActivation = containsTrigger(
                transcript.content.toLowerCase(),
                voiceActivationTriggers,
              );

              if (useVoiceActivation && !listening) {
                Logger.debug("Voice activation triggered:", transcript.content.toLowerCase());
                voiceActivationTimes.set(userId, new Date());

                const activationPlayer = createAudioPlayer();
                activationPlayer.on("error", (e) => Logger.error("Error playing activation sound:", e));
                activationPlayer.play(voiceActivationSound);
                connection.subscribe(activationPlayer);
              } else if (containsTrigger(transcript.content.toLowerCase(), disconnectTriggers)) {
                Logger.debug("Disconnect triggered:", transcript.content);

                await this.followUp(await session.runCommand(LivetalkSessionCommand.Stop, userId));
              } else {
                Logger.debug("Assistant triggered:", transcript.content);

                const response = await conversation.ask(transcript.content, {
                  username: user.username,
                  voicechat: {
                    participants: voiceChannel.members
                      .filter((x) => x.id !== this.bot.discordClient.user?.id)
                      .map((x) => ({
                        username: x.user.username,
                      })),
                  },
                });
                const ttsResponse = response.replaceAll("*", "")
                  .replaceAll("_", "")
                  .replaceAll("~", "");

                try {
                  const ttsBuffer = await this.bot.ttsManager.generate(ttsResponse);
                  const ttsStream = Readable.from(ttsBuffer);
                  const resource = createAudioResource(ttsStream);
                  const player = createAudioPlayer();
                  player.play(resource);
                  connection.subscribe(player);
                } catch (e) {
                  Logger.error("Couldn't play tts:", e);
                }

                await this.followUp(`In response to ${user.username}:\n\n${response}`);
              }
            } else if (!this.args?.subcommands?.ai) {
              await this.followUp(`${user.username}: ${transcript.content}`);
            }

            await rm(mp3FilePath);
            await rm(pcmFilePath);
          } catch (e) {
            Logger.error("Transcribe error:", e);

            try {
              // sessionUser?.addStrike();

              await rm(mp3FilePath);
              await rm(pcmFilePath);
            } catch (err2) {
              Logger.error("Error cleaning up:", err2);
            }
          }
        });
        subscription.once("end", () => {
          Logger.debug(`User ${userId} stopped speaking.`);
        });
      } catch (e) {
        Logger.error("Error during speaking handler:", e);
      }
    });

    connection.on(VoiceConnectionStatus.Disconnected, async () => {
      try {
        await Promise.race([
          entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
          entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
        ]);
        // Seems to be reconnecting to a new channel - ignore disconnect
      } catch (error) {
        // Seems to be a real disconnect which SHOULDN'T be recovered from
        session.stop();
      }
    });

    connection.on(VoiceConnectionStatus.Destroyed, () => {
      sessions.delete(voiceChannel.id);
    });

    return `Started session in <#${voiceChannel.id}>.`;
  }
}
