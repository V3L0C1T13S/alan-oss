import mongoose from "mongoose";
import { BaseDatabaseModel, CommandCounts } from "../../model/index.js";
import { Bot } from "../../../../../Bot.js";
import { CommandCount } from "./counts.js";
import { Logger } from "../../../logger.js";
import { mongoURL } from "../../../../../constants/index.js";

export class MongoDbManager extends BaseDatabaseModel {
  connection: mongoose.Mongoose;

  constructor(bot: Bot) {
    super(bot);

    this.connection = mongoose;
  }

  async init() {
    await this.connection.connect(`${mongoURL}/alan-oss`);

    Logger.success("Connected to MongoDB.");
  }

  async getCounts() {
    const dbCounts = await CommandCount.find();
    const countObject: CommandCounts = {};

    dbCounts.forEach((count) => {
      const { name, counts } = count;
      if (!name || !counts) return;

      countObject[name] = counts;
    });

    return countObject;
  }

  async addCount(name: string) {
    const existing = await CommandCount.findOne({ name });
    await CommandCount.updateOne({
      name,
    }, {
      name,
      counts: (existing?.counts ?? 0) + 1,
    }, {
      upsert: true,
    });
  }

  async stop() {
    await this.connection.disconnect();
  }
}
