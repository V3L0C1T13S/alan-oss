import { ulid } from "ulid";
import { Logger } from "../../../logger.js";
import {
  llamaBin, llamaModel, llamaNGL, llamaThreads,
} from "../../../../../constants/index.js";
import { BaseAIManager } from "../../model/index.js";
import { Llama } from "./llama_wrapper.js";
import { LlamaConversation } from "./conversation.js";
import { GenericAIConversationManager } from "../../generic/index.js";
import { BaseDatabaseModel } from "../../../database/index.js";

export const assistantName = "Ailsa";

const defaultTemplate = `Transcript of a dialog, where the User interacts with an AI Assistant named ${assistantName}. ${assistantName} is helpful, kind, honest, and never fails to answer the User's requests immediately and with precision.

User: Hi, ${assistantName}.
${assistantName}: Hello! How may I help you today?
User: Please tell me the weather.
${assistantName}: It is currently sunny out, the temperature is 97 degrees with a wind speed of 20 MPH. It is expected to rain later today.
User: `;

export class LlamaAIManager extends BaseAIManager<any, string, string> {
  private conversationManager = new GenericAIConversationManager();

  llama: Llama;

  constructor(db: BaseDatabaseModel) {
    super(db);

    if (!llamaBin || !llamaModel) throw new Error("Your llama ENV variables are set incorrectly.");

    this.llama = new Llama(llamaBin, llamaModel);
    this.llama.setStopText("User:");

    if (llamaThreads) this.llama.setThreads(llamaThreads);
    if (llamaNGL) this.llama.setNgl(llamaNGL);
  }

  async init() {
    Logger.info("Llama is OK!");
  }

  generatePrompt(prompt: string, template = defaultTemplate) {
    return `${template}${prompt}\n${assistantName}:`;
  }

  extractResult(result: string, prompt: string) {
    return result.replaceAll(prompt, "")
      .replaceAll("User:", "")
      .replaceAll(`${assistantName}:`, "") // FIXME: is this needed?
      .trimStart()
      .trim();
  }

  async ask(prompt: string) {
    const fullPrompt = this.generatePrompt(prompt);
    const result = await this.llama.ask(fullPrompt);

    return this.extractResult(result, fullPrompt);
  }

  async createConversation(owner?: string | undefined) {
    const conversation = new LlamaConversation(ulid(), this, owner);
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
    this.conversationManager.setCurrentConversation(owner, id);
  }

  async getCurrentConversation(owner: string) {
    return this.conversationManager.getCurrentConversation(owner);
  }

  async closeConversation(id: string): Promise<void> {
    return this.conversationManager.closeConversation(id);
  }
}
