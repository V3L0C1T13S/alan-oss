import { Logger } from "../../../logger.js";
import {
  BaseDatabaseModel,
  CommandCounts,
  ConversationData,
  EditConversationData,
  FindConversationData,
  FindTagData,
  TagData,
} from "../../model/index.js";

export class DummyDatabaseManager extends BaseDatabaseModel {
  addConversation(data: ConversationData): Promise<ConversationData> {
    throw new Error("Method not implemented.");
  }

  // eslint-disable-next-line max-len
  editConversation(find: FindConversationData, data: EditConversationData): Promise<ConversationData> {
    throw new Error("Method not implemented.");
  }

  getConversation(find: FindConversationData): Promise<ConversationData | null> {
    throw new Error("Method not implemented.");
  }

  deleteConversation(find: FindConversationData): Promise<void> {
    throw new Error("Method not implemented.");
  }

  protected commandCounts: CommandCounts = {};
  protected tags: TagData[] = [];

  async init() {
    Logger.info("DummyDatabaseInit");
  }

  async getCounts() {
    return this.commandCounts;
  }

  async addCount(name: string) {
    let count = this.commandCounts[name];
    if (!count) this.commandCounts[name] = 0;
    else count += 1;
  }

  async addTag(data: TagData) {
    this.tags.push(data);

    return data;
  }

  async editTag(find: FindTagData, data: Partial<TagData>) {
    const existing = await this.getTag(find);

    if (!existing) throw new Error("Tag not found.");

    if (data.author) existing.author = data.author;
    if (data.name) existing.name = data.name;
    if (data.content) existing.content = data.content;

    return existing;
  }

  async getTag(data: FindTagData) {
    return this.tags
      .find((tag) => tag.author === data.author && tag.name === data.name) ?? null;
  }

  async deleteTag(data: FindTagData) {
    // TODO
  }

  async stop() {
    Logger.info("DummyDatabaseStop");
  }
}
