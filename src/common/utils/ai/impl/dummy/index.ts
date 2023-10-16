import { ulid } from "ulid";
import { Logger } from "../../../logger.js";
import { BaseAIManager } from "../../model/index.js";
import { DummyConversation } from "./conversation.js";
import { GenericAIConversationManager } from "../../generic/index.js";

export class DummyAIManager extends BaseAIManager {
  private conversationManager = new GenericAIConversationManager();

  async init(initParams: any) {
    Logger.info("Using dummy AI manager.");
  }

  async ask(prompt: string) {
    return "Dummy response.";
  }

  async createConversation(owner?: string | undefined) {
    const conversation = new DummyConversation(ulid(), owner);
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
