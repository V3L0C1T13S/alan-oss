import { Bot } from "Bot";
import { type CommandCounts } from "./types.js";

export abstract class BaseDatabaseModel {
  bot: Bot;

  constructor(bot: Bot) {
    this.bot = bot;
  }

    abstract init(): Promise<void>;

    abstract addCount(name: string): Promise<void>;

    abstract getCounts(): Promise<CommandCounts>;

    abstract stop(): Promise<void>;
}

export * from "./types.js";
