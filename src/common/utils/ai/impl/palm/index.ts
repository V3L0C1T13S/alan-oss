import { ulid } from "ulid";
import PaLM from "palm-api";
import { Logger } from "../../../logger.js";
import { BaseAIManager } from "../../model/index.js";
import { PalmConversation } from "./conversation.js";
import { GenericAIConversationManager } from "../../generic/index.js";
import { BaseDatabaseModel } from "../../../database/index.js";
import { palmKey } from "../../../../../constants/index.js";

export class PalmAIManager extends BaseAIManager {
  private conversationManager = new GenericAIConversationManager();
  palm: PaLM;

  constructor(db: BaseDatabaseModel) {
    super(db);

    if (!palmKey) throw new Error("Please set your Palm key before using PaLM.");

    this.palm = new PaLM(palmKey);
  }

  async init(initParams: any) {
    Logger.success("Using PaLM API.");
  }

  async ask(prompt: string) {
    const result = await this.palm.ask(prompt);

    return result;
  }

  async createConversation(owner?: string | undefined) {
    const conversation = new PalmConversation(this, ulid(), owner);
    this.conversationManager.insertConversation(conversation);

    return conversation;
  }

  async getConversation(id: string) {
    return this.conversationManager.getConversation(id);
  }

  async getConversationsByOwner(owner: string) {
    return this.conversationManager.getConversationsByOwner(owner);
  }

  async getConversationByOwner(owner: string, id: string) {
    return this.conversationManager.getConversationByOwner(owner, id);
  }

  async setCurrentConversation(owner: string, id: string) {
    return this.conversationManager.setCurrentConversation(owner, id);
  }

  async getCurrentConversation(owner: string) {
    return this.conversationManager.getCurrentConversation(owner);
  }

  async closeConversation(id: string) {
    return this.conversationManager.closeConversation(id);
  }
}
