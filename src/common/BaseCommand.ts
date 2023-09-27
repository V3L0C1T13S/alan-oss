import {
  APIAttachment,
  APIEmbed,
  Channel,
  ChannelType,
  Client,
  Guild,
  Interaction,
  Message,
  MessageCreateOptions,
  MessagePayload,
  RepliableInteraction,
  User,
} from "discord.js";
import { Bot } from "../Bot";
import { CommandParameter } from "./Parameter.js";
import { Logger } from "./utils/index.js";

type TextCommandType = "text"

type InteractionCommandType = "interaction";

type CommandType = TextCommandType | InteractionCommandType;

export type ClientType = "discord" | "revolt";

export type CommandArguments = Record<string, string | boolean | any[]>;

interface CommandArgs {
  users?: User[];
  subcommands?: CommandArguments;
}

export interface BaseCommandOptions {
    type: CommandType,
    clientType: ClientType,
    channel?: Channel,
    args?: CommandArgs,
}

export interface BaseTextCommandOptions extends BaseCommandOptions {
    type: TextCommandType,
    message: Message,
}

export interface BaseInteractionCommandOptions extends BaseCommandOptions {
    type: InteractionCommandType,
    interaction: Interaction,
}

export type CommandOptions = BaseTextCommandOptions | BaseInteractionCommandOptions;

interface FullGenericReply {
    content?: string,
    embeds?: APIEmbed[],
    attachments?: APIAttachment[],
}

type GenericReply = FullGenericReply | string;

export interface initParameters {
  bot: Bot;
}

export class BaseCommand {
  name = "Command";
  type: CommandType;
  category = "Unset";

  bot: Bot;
  client: Client;
  clientType: ClientType;
  message?: Message;
  channel?: Channel | null | undefined;
  guild?: Guild | null | undefined;
  interaction?: RepliableInteraction;
  author!: User;
  args?: CommandArgs;

  constructor(bot: Bot, client: Client, options: CommandOptions) {
    this.bot = bot;
    this.client = client;
    this.type = options.type;
    this.clientType = options.clientType;
    if (options.args) this.args = options.args;

    if (options.type === "text") {
      this.author = options.message.author;
      this.message = options.message;
    } else if (options.type === "interaction") {
      this.channel = options.interaction.channel;
      this.author = options.interaction.user;
    }

    if (options.channel) this.channel = options.channel;

    if (this.channel && "guild" in this.channel) {
      this.guild = this.channel.guild;
    }
  }

  async run(): Promise<GenericReply> {
    return {
      embeds: [{
        title: "get lmao'd",
        description: "(this isnt implemented yet)",
      }],
    };
  }

  async ack() {
    if (this.type === "text" && this.message) {
      const channel = this.channel ?? await this.client.channels.fetch(this.message.channelId);
      if (!channel?.isTextBased()) return;
      if (channel.type === ChannelType.GuildStageVoice) return;

      await channel.sendTyping();
    } else if (!this.interaction?.deferred) {
      await this.interaction?.deferReply();
    }
  }

  async send(content: string | MessagePayload | MessageCreateOptions) {
    if (this.type === "text" && this.message) {
      const channel = this.channel ?? await this.client.channels.fetch(this.message.channelId);
      if (!channel?.isTextBased()) return;

      await channel.send(content);
    } else {
      await this.interaction?.channel?.send(content);
    }
  }

  async trySend(content: string | MessagePayload | MessageCreateOptions) {
    await this.send(content).catch(Logger.error);
  }

  protected joinArgsToString() {
    if (!this.args?.subcommands) return;

    return Object.values(this.args.subcommands).join(" ");
  }

  static async init(params: initParameters) {
    return this;
  }

  // eslint-disable-next-line no-use-before-define
  static description: BaseCommandConstructor["description"] = "No description found.";
  // eslint-disable-next-line no-use-before-define
  static aliases: BaseCommandConstructor["aliases"] = [];
  // eslint-disable-next-line no-use-before-define
  static parameters: BaseCommandConstructor["parameters"] = [];
  // eslint-disable-next-line no-use-before-define
  static interactionsAllowed: BaseCommandConstructor["interactionsAllowed"] = true;
  // eslint-disable-next-line no-use-before-define
  static textAllowed: BaseCommandConstructor["textAllowed"] = true;
  // eslint-disable-next-line no-use-before-define
  static private: BaseCommandConstructor["private"] = false;
}

export interface BaseCommandConstructor extends BaseCommand {
    new(bot: Bot, client: Client, options: CommandOptions): BaseCommand,

    init(params: initParameters): Promise<any>;
    description: string,
    aliases: string[],
    parameters: CommandParameter[],
    interactionsAllowed: boolean,
    textAllowed: boolean,
    private: boolean,
}
