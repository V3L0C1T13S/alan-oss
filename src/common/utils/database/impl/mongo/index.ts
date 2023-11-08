import mongoose from "mongoose";
import {
  BaseDatabaseModel, CommandCounts, DbUser, EditTagData, FindDbUser, FindTagData, TagData,
} from "../../model/index.js";
import { Bot } from "../../../../../Bot.js";
import { CommandCount } from "./counts.js";
import { Logger } from "../../../logger.js";
import { mongoURL } from "../../../../../constants/index.js";
import { Tag } from "./tag.js";
import {
  ConversationData, EditConversationData, FindConversationByOwnerData, FindConversationData,
} from "../../model/conversation.js";
import { Conversation } from "./conversation.js";
import { User } from "./user.js";

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

  async getConversationByOwner(find: FindConversationByOwnerData) {
    const conversation = await Conversation.findOne(find);

    return conversation?.toObject() ?? null;
  }

  async getAllConversationsByOwner(owner: string) {
    const conversations = await Conversation.find({ owner });

    return conversations.map((convo) => convo.toObject());
  }

  async saveConversation(find: FindConversationData, data: Partial<ConversationData>) {
    await Conversation.updateOne(find, data, {
      upsert: true,
    });
  }

  async editConversation(find: FindConversationData, data: EditConversationData) {
    const updated = await Conversation.findOneAndUpdate(find, data);
    if (!updated) throw new Error(`Could not find conversation ${find.id}.`);

    return updated.toObject();
  }

  async deleteConversation(find: FindConversationData) {
    await Conversation.deleteOne(find);
  }

  async createUser(data: DbUser) {
    const user = await User.create(data);

    return user.toObject();
  }

  async updateUser(find: FindDbUser, update: Partial<DbUser>) {
    const user = await User.findOne(find);
    if (!user) throw new Error(`User ${find.id} not found.`);

    await user.updateOne(update);

    return user;
  }

  async getUser(data: FindDbUser): Promise<DbUser | null> {
    const user = await User.findOne(data);

    return user?.toObject() ?? null;
  }

  async findUserByDiscord(discord: string): Promise<DbUser | null> {
    const user = await User.findOne({ "accounts.discord": discord });

    return user?.toObject() ?? null;
  }

  async findUserByRevolt(revolt: string) {
    const user = await User.findOne({ accounts: { revolt } });

    return user?.toObject() ?? null;
  }

  async stop() {
    await this.connection.disconnect();
  }
}
