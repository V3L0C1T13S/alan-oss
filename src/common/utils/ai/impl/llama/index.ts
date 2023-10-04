import { ulid } from "ulid";
import { Logger } from "../../../logger.js";
import { llamaBin, llamaModel } from "../../../../../constants/index.js";
import { BaseAIManager, Conversation } from "../../model/index.js";
import { Llama } from "./llama_wrapper.js";
import { LlamaUser } from "./types.js";
import { LlamaConversation } from "./conversation.js";

export const assistantName = "Ailsa";

const template = `Transcript of a dialog, where the User interacts with an AI Assistant named ${assistantName}. ${assistantName} is helpful, kind, honest, and never fails to answer the User's requests immediately and with precision.

User: Hi, ${assistantName}.
${assistantName}: Hello! How may I help you today?
User: Please tell me the weather.
${assistantName}: It is currently sunny out, the temperature is 97 degrees with a wind speed of 20 MPH. It is expected to rain later today.
User:`;

export class LlamaAIManager extends BaseAIManager<any, string, string> {
  private users: Map<string, LlamaUser> = new Map();
  private conversations: Map<string, LlamaConversation> = new Map();

  llama: Llama;

  constructor() {
    super();

    if (!llamaBin || !llamaModel) throw new Error("Your llama ENV variables are set incorrectly.");

    this.llama = new Llama(llamaBin, llamaModel);
    this.llama.setStopText("User:");
  }

  async init() {
    Logger.info("Llama is OK!");
  }

  generatePrompt(prompt: string) {
    return `${template} ${prompt}\n${assistantName}:`;
  }

  extractResult(result: string, prompt: string) {
    return result.replaceAll(prompt, "")
      .replaceAll("User:", "");
  }

  async ask(prompt: string) {
    const fullPrompt = this.generatePrompt(prompt);
    const result = await this.llama.ask(fullPrompt);

    return this.extractResult(result, fullPrompt);
  }

  async createConversation(owner?: string | undefined) {
    const id = ulid();
    const conversation = new LlamaConversation(id, this, owner);

    if (owner) {
      this.users.set(owner, {
        id: owner,
      });
    }

    this.conversations.set(id, conversation);

    return conversation;
  }

  async getConversation(id: string) {
    return this.conversations.get(id);
  }

  async getConversationsByOwner(owner: string) {
    return [...this.conversations.values()].filter((x) => x.owner === owner);
  }

  async getConversationByOwner(owner: string, id: string) {
    const conversation = this.conversations.get(id);

    if (conversation?.owner !== owner) return;

    return conversation;
  }

  async setCurrentConversation(owner: string, id: string) {
    const user = this.users.get(owner);
    if (!user) throw new Error("User not found");

    user.current_conversation = id;
  }

  async getCurrentConversation(owner: string) {
    const user = this.users.get(owner);
    if (!user?.current_conversation) return;

    return this.getConversation(user.current_conversation);
  }

  async closeConversation(id: string): Promise<void> {
    this.conversations.delete(id);
  }
}
