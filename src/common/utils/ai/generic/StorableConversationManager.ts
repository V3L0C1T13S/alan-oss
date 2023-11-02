import { BaseDatabaseModel } from "../../database/index.js";
import { StorableConversation } from "./StorableConversation.js";

export class StorableConversationManager {
  private db: BaseDatabaseModel;

  constructor(db: BaseDatabaseModel) {
    this.db = db;
  }

  async insertConversation(conversation: StorableConversation) {
    await conversation.save();
  }

  async getConversation(id: string) {
    const dbConversation = await this.db.getConversation({ id });

    if (!dbConversation) return;

    return dbConversation;
  }

  async getConversationByOwner(owner: string, id: string) {
    return this.db.getConversationByOwner({ id, owner });
  }
}
