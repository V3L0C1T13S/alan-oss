import { BaseDatabaseModel } from "../../database/index.js";
import { Conversation } from "./conversation.js";

export * from "./conversation.js";

export abstract class BaseAIManager<initParams = any, promptReturn = string, promptArgs = string> {
  db: BaseDatabaseModel;

  constructor(db: BaseDatabaseModel) {
    this.db = db;
  }

  abstract init(initParams: initParams): Promise<void>

  abstract ask(prompt: promptArgs): Promise<promptReturn>

  abstract createConversation(owner?: string): Promise<Conversation>
  abstract getConversation(id: string): Promise<Conversation | undefined>
  abstract getConversationByOwner(owner: string, id: string): Promise<Conversation | undefined>
  abstract getConversationsByOwner(owner: string): Promise<Conversation[]>

  abstract setCurrentConversation(owner: string, id: string): Promise<void>
  abstract getCurrentConversation(owner: string): Promise<Conversation | undefined>

  async getOrCreateCurrentConversation(owner: string): Promise<Conversation> {
    const existing = await this.getCurrentConversation(owner);

    if (existing) return existing;

    const conversation = await this.createConversation(owner);
    await this.setCurrentConversation(owner, conversation.id);
    return conversation;
  }

  abstract closeConversation(id: string): Promise<void>
}
