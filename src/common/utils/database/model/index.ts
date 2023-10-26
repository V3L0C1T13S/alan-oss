import { Bot } from "Bot";
import { type CommandCounts } from "./types.js";
import { TagData, EditTagData, FindTagData } from "./tag.js";

export * from "./types.js";
export * from "./tag.js";

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

  abstract stop(): Promise<void>;
}
