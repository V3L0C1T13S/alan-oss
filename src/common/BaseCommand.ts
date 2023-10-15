import {
  APIAttachment,
  APIEmbed,
  AttachmentBuilder,
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
import { ulid } from "ulid";
import { Bot } from "../Bot";
import { CommandParameter } from "./Parameter.js";
import { Logger } from "./utils/index.js";
import { ClientType } from "./types/index.js";

type TextCommandType = "text"

type InteractionCommandType = "interaction";

type CommandType = TextCommandType | InteractionCommandType;

export type CommandArguments = Record<string, string | boolean | number | any[]>;

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

export interface FullGenericReply {
  content?: string,
  embeds?: APIEmbed[],
  attachments?: APIAttachment[],
  files?: AttachmentBuilder[],
}

// null == "i will handle replying myself"
export type GenericReply = FullGenericReply | string | null;

export interface initParameters {
  bot: Bot;
}

export interface GenericAttachment {
  /**
   * ID guarunteed to be present on Discords CDN
  */
  discord_id?: string,
  /** ID generated by us for data storage */
  id: string,
  url: string,
  proxy_url?: string,
  type?: string | null,
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
  attachments?: Message["attachments"];

  constructor(bot: Bot, client: Client, options: CommandOptions) {
    this.bot = bot;
    this.client = client;
    this.type = options.type;
    this.clientType = options.clientType;
    if (options.args) this.args = options.args;

    if (options.type === "text") {
      this.message = options.message;
      this.author = options.message.author;
      this.attachments = options.message.attachments;
    } else if (options.type === "interaction") {
      // @ts-ignore stfu :)
      this.interaction = options.interaction;
      this.channel = options.interaction.channel;
      this.author = options.interaction.user;
      if (options.interaction.isChatInputCommand()) {
        const attachments = options.interaction.options.resolved?.attachments;
        if (attachments) this.attachments = attachments;
      }
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

    return Object.values(this.args.subcommands).flat().join(" ");
  }

  protected async getFirstAttachment(): Promise<GenericAttachment | undefined> {
    const id = ulid();
    const message = this.message?.reference ? await this.message.fetchReference() : this.message;
    // our attachments or reply attachments first
    const attachment = this.attachments?.first() ?? message?.attachments.first();

    if (attachment) {
      return {
        discord_id: attachment.id,
        id,
        url: attachment.url,
        proxy_url: attachment.proxyURL,
        type: attachment.contentType,
      };
    }

    if (message) {
      // TODO (revolt): this wont work because revolt does a late update for embeds
      if (message.embeds[0]) {
        const embed = message.embeds[0];

        if (embed.video && embed.video.proxyURL) {
          return {
            id,
            url: embed.video.url,
            proxy_url: embed.video.proxyURL,
            type: "video",
          };
        }
        if (embed.image && embed.image.proxyURL) {
          return {
            id,
            url: embed.image.url,
            proxy_url: embed.image.proxyURL,
            type: "image",
          };
        }
        if (embed.thumbnail && embed.thumbnail.proxyURL) {
          return {
            id,
            url: embed.thumbnail.url,
            proxy_url: embed.thumbnail.proxyURL,
            type: "image",
          };
        }
      }
    }

    const url = this.args?.subcommands?.url;
    if (url && typeof url === "string") {
      // TODO: proxy url
      return {
        id,
        url,
      };
    }

    return;
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
