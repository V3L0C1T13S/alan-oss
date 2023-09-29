import Mongoose from "mongoose";
import { BaseDatabaseModel, CommandCounts } from "../../model/index.js";
import { Bot } from "../../../../../Bot.js";
import { Counts } from "./counts.js";
import { Logger } from "../../../logger.js";
import { mongoURL } from "../../../../../constants/index.js";

export class MongoDbManager extends BaseDatabaseModel {
  connection: Mongoose.Mongoose;

  constructor(bot: Bot) {
    super(bot);

    this.connection = Mongoose;
  }

  async init() {
    await this.connection.connect(mongoURL);

    Logger.success("Connected to MongoDB.");
  }

  async getCounts() {
    const dbCounts = await Counts.find();
    const countObject: CommandCounts = {};

    dbCounts.forEach((count) => {
      const { name, counts } = count;
      if (!name || !counts) return;

      countObject[name] = counts;
    });

    return countObject;
  }

  async addCount(name: string) {
    const existing = await Counts.findOne({ name });
    await Counts.updateOne({
      name,
    }, {
      name,
      counts: (existing?.counts ?? 0) + 1,
    });
  }

  async stop() {
    await this.connection.disconnect();
  }
}
