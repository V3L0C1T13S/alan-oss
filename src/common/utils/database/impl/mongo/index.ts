import Mongoose from "mongoose";
import { BaseDatabaseModel, CommandCounts } from "../../model/index.js";
import { Bot } from "../../../../../Bot.js";
import { Counts } from "./counts.js";

export class MongoDbManager extends BaseDatabaseModel {
  connection: Mongoose.Mongoose;

  constructor(bot: Bot) {
    super(bot);

    this.connection = Mongoose;
  }

  async init() {
    await this.connection.connect("mongo://localhost:27017");
  }

  async getCounts() {
    const counts = await Counts.find();
    const countObject: CommandCounts = {};

    counts.forEach((count) => {
      const { name, counts } = count;
      if (!name || !counts) return;

      countObject[name] = counts;
    });

    return countObject;
  }

  async addCount(name: string) {
    throw new Error("Method not implemented.");
  }

  async stop() {
    throw new Error("Method not implemented.");
  }
}
