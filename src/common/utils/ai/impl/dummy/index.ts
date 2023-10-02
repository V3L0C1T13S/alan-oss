import { ulid } from "ulid";
import { Logger } from "../../../logger.js";
import { BaseAIManager, Conversation } from "../../model/index.js";
import { DummyConversation } from "./conversation.js";

type DummyUser = {
    id: string,
    current_conversation?: string | null,
}

export class DummyAIManager extends BaseAIManager {
  private users: Map<string, DummyUser> = new Map();

  private conversations: Map<string, DummyConversation> = new Map();

  async init(initParams: any) {
    Logger.info("Using dummy AI manager.");
  }

  async ask(prompt: string) {
    return "Dummy response.";
  }

  async createConversation(owner?: string | undefined): Promise<Conversation> {
    const id = ulid();

    const conversation = new DummyConversation(id, owner);

    this.conversations.set(id, conversation);

    return conversation;
  }

  async getConversation(id: string): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }

  async getConversationsByOwner(owner: string): Promise<Conversation[]> {
    throw new Error("Method not implemented.");
  }

  async setCurrentConversation(owner: string, id: string): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async getCurrentConversation(owner: string): Promise<Conversation | undefined> {
    throw new Error("Method not implemented.");
  }

  async closeConversation(id: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
