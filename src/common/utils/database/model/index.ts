import { ulid } from "ulid";
import { Bot } from "../../../../Bot.js";
import { type CommandCounts } from "./types.js";
import { TagData, EditTagData, FindTagData } from "./tag.js";
import {
  ConversationData, EditConversationData, FindConversationByOwnerData, FindConversationData,
} from "./conversation.js";
import { DbUser, FindDbUser, UpdateDbUser } from "./user.js";
import { ClientType } from "../../../types/index.js";

export * from "./types.js";
export * from "./tag.js";
export * from "./conversation.js";
export * from "./user.js";

export abstract class BaseDatabaseModel {
  bot: Bot;

  constructor(bot: Bot) {
    this.bot = bot;
  }

  abstract init(): Promise<void>;
  abstract addCount(name: string): Promise<void>;
  abstract getCounts(): Promise<CommandCounts>;

  abstract addTag(data: TagData): Promise<TagData>;
  abstract editTag(find: FindTagData, data: EditTagData): Promise<TagData>;
  abstract getTag(data: FindTagData): Promise<TagData | null>;
  abstract deleteTag(data: FindTagData): Promise<void>;

  abstract addConversation(data: ConversationData): Promise<ConversationData>;
  abstract saveConversation(
    find: FindConversationData,
    data: Partial<ConversationData>
  ): Promise<void>;
  abstract editConversation(
    find: FindConversationData,
    data: EditConversationData
  ): Promise<ConversationData>;
  abstract getConversation(find: FindConversationData): Promise<ConversationData | null>;
  abstract getConversationByOwner(
    find: FindConversationByOwnerData
  ): Promise<ConversationData | null>;
  abstract getAllConversationsByOwner(owner: string): Promise<ConversationData[]>;
  abstract deleteConversation(find: FindConversationData): Promise<void>;

  abstract createUser(data: DbUser): Promise<DbUser>;
  abstract getUser(data: FindDbUser): Promise<DbUser | null>;
  abstract updateUser(find: FindDbUser, update: UpdateDbUser): Promise<DbUser>;
  abstract findUserByDiscord(discord: string): Promise<DbUser | null>;
  abstract findUserByRevolt(revolt: string): Promise<DbUser | null>;

  async getOrCreateUser(find: FindDbUser, data: DbUser) {
    const user = await this.getUser(find) ?? await this.createUser(data);

    return user;
  }

  async getOrCreateUserByPlatform(platform: ClientType, id: string) {
    if (platform === "discord") return this.getOrCreateDiscordUser(id);
    return this.getOrCreateRevoltUser(id);
  }

  async getOrCreateDiscordUser(discord: string) {
    const user = await this.findUserByDiscord(discord) ?? await this.createUser({
      id: ulid(),
      accounts: { discord },
    });

    return user;
  }

  async getOrCreateRevoltUser(revolt: string) {
    const user = await this.findUserByRevolt(revolt) ?? await this.createUser({
      id: ulid(),
      accounts: { revolt },
    });

    return user;
  }

  abstract stop(): Promise<void>;
}
