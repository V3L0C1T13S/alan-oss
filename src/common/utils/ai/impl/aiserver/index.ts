import Axios from "axios";
import { ulid } from "ulid";
import { GenericAIConversationManager } from "../../generic/index.js";
import { BaseAIManager } from "../../model/index.js";
import { Logger } from "../../../logger.js";
import { GenerateResponse } from "./types.js";
import { AIServerConversation } from "./conversation.js";

export class AIServerManager extends BaseAIManager {
  private conversationManager = new GenericAIConversationManager();
  private axios = Axios.create({
    baseURL: "http://localhost:3016",
  });

  async init() {
    Logger.success("Using AIServer.");
  }

  async ask(prompt: string) {
    const response = await this.axios.post<GenerateResponse>("/generate", {
      prompt,
    });
    const { data } = response;

    Logger.debug("response:", data);

    return data.response;
  }

  async createConversation(owner?: string | undefined) {
    const conversation = new AIServerConversation(this, ulid(), owner);
    this.conversationManager.insertConversation(conversation);

    return conversation;
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
    this.conversationManager.closeConversation(id);
  }
}
