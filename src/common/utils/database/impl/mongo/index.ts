import mongoose from "mongoose";
import {
  BaseDatabaseModel, CommandCounts, EditTagData, FindTagData, TagData,
} from "../../model/index.js";
import { Bot } from "../../../../../Bot.js";
import { CommandCount } from "./counts.js";
import { Logger } from "../../../logger.js";
import { mongoURL } from "../../../../../constants/index.js";
import { Tag } from "./tag.js";
import { ConversationData, EditConversationData, FindConversationData } from "../../model/conversation.js";
import { Conversation } from "./conversation.js";

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

  async addTag(data: TagData) {
    const tag = await Tag.create(data);

    return tag.toObject();
  }

  async editTag(find: FindTagData, data: EditTagData) {
    const tag = await Tag.findOneAndUpdate(find, data);
    if (!tag) throw new Error("Tag not found.");

    return tag.toObject();
  }

  async getTag(data: FindTagData) {
    const tag = await Tag.findOne(data);

    return tag?.toObject() ?? null;
  }

  async deleteTag(data: FindTagData) {
    await Tag.deleteOne(data);
  }

  async addConversation(data: ConversationData): Promise<ConversationData> {
    const conversation = await Conversation.create(data);

    return conversation.toObject();
  }

  async getConversation(find: FindConversationData) {
    const conversation = await Conversation.findOne(find);

    return conversation?.toObject() ?? null;
  }

  async editConversation(find: FindConversationData, data: EditConversationData) {
    const updated = await Conversation.findOneAndUpdate(find, data);
    if (!updated) throw new Error(`Could not find conversation ${find.id} by ${find.owner}.`);

    return updated.toObject();
  }

  async deleteConversation(find: FindConversationData) {
    await Conversation.deleteOne(find);
  }

  async stop() {
    await this.connection.disconnect();
  }
}
