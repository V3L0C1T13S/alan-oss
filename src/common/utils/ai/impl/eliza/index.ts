import { ulid } from "ulid";
import ElizaBot from "elizabot";
import { BaseAIManager } from "../../model/index.js";
import { ElizaConversation } from "./conversation.js";
import { GenericAIConversationManager } from "../../generic/index.js";
import { Logger } from "../../../logger.js";

export class ElizaAIManager extends BaseAIManager {
  private conversationManager = new GenericAIConversationManager();

  async init(initParams: any) {
    Logger.info("ELIZA initialized.");
  }

  async ask(prompt: string) {
    const eliza = new ElizaBot();
    return eliza.transform(prompt);
  }

  async createConversation(owner?: string | undefined) {
    const conversaton = new ElizaConversation(ulid(), owner);
    this.conversationManager.insertConversation(conversaton);

    return conversaton;
  }

  async getConversation(id: string) {
    return this.conversationManager.getConversation(id);
  }

  async getConversationByOwner(owner: string, id: string) {
    return this.conversationManager.getConversationByOwner(owner, id);
  }

  async getConversationsByOwner(owner: string) {
    return this.conversationManager.getConversationsByOwner(owner);
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
