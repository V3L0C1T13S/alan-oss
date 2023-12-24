import { ulid } from "ulid";
import OpenAI from "openai";
import { readFileSync } from "node:fs";
import { characters } from "../../../characters.js";
import { Logger } from "../../../logger.js";
import { BaseAIManager } from "../../model/index.js";
import { GenericAIConversationManager } from "../../generic/index.js";
import { OpenAIConversation } from "./conversation.js";
import { openAIBaseURL, openAIToken } from "../../../../../constants/index.js";
import { BaseDatabaseModel } from "../../../database/index.js";

export class OpenAIManager extends BaseAIManager {
  private conversationManager = new GenericAIConversationManager();
  private openai: OpenAI;

  constructor(db: BaseDatabaseModel) {
    super(db);

    if (!openAIToken) throw new Error("Please specify an OpenAPI token!");

    const options: any = {};
    if (openAIBaseURL) options.baseURL = openAIBaseURL;
    options.apiKey = openAIToken;

    this.openai = new OpenAI(options);
  }

  async init(initParams: any) {
    Logger.success("Using OpenAI manager.");
  }

  async ask(prompt: string) {
    const response = await this.openai.chat.completions.create({
      model: "mistralai/Mistral-7B-v0.1",
      messages: [{ role: "user", content: prompt }],
    });

    const choice = response.choices[0];
    if (!choice?.message.content) throw new Error("model generated no choices");
    return choice.message.content;
  }

  async createConversation(owner?: string | undefined) {
    const conversation = new OpenAIConversation(this, this.openai, ulid(), owner);
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
