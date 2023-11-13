import Bard from "bard-ai";
import { ulid } from "ulid";
import { bardCookie, bardPSIDTS } from "../../../../../constants/index.js";
import { BaseAIManager } from "../../model/index.js";
import { Logger } from "../../../logger.js";
import { BardConversation } from "./conversation.js";
import { BardPrompt, BardResponse } from "./types.js";
import { GenericAIConversationManager } from "../../generic/conversationManager.js";
import { BaseDatabaseModel } from "../../../database/index.js";

export * from "./conversation.js";

export class BardAIManager extends BaseAIManager<any, BardResponse, BardPrompt> {
  private bard: Bard;

  private conversationManager = new GenericAIConversationManager();

  constructor(db: BaseDatabaseModel) {
    super(db);

    if (!bardCookie || !bardPSIDTS) throw new Error("Bard token not specified.");

    this.bard = new Bard({
      "__Secure-1PSID": bardCookie,
      "__Secure-1PSIDTS": bardPSIDTS,
    });
  }

  async init() {
    Logger.success("Using Bard AI backend.");
    Logger.warn("Bard cookies are known to be unstable. Do NOT use in production environments.");
  }

  async ask(prompt: string) {
    const result = await this.bard.ask(prompt);

    return typeof result === "string" ? result : result.content;
  }

  async createConversation(owner?: string) {
    const chat = this.bard.createChat();
    const conversation = new BardConversation(ulid(), chat, owner);
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

  async setCurrentConversation(owner: string, id: string): Promise<void> {
    return this.conversationManager.setCurrentConversation(owner, id);
  }

  async getCurrentConversation(owner: string) {
    return this.conversationManager.getCurrentConversation(owner);
  }

  async closeConversation(id: string) {
    this.conversationManager.closeConversation(id);
  }
}
