import { ulid } from "ulid";
import { Logger } from "../../../logger.js";
import { BaseAIManager, Conversation } from "../../model/index.js";
import { DummyConversation } from "./conversation.js";
import { DummyUser } from "./types.js";

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

    if (owner) {
      this.users.set(owner, {
        id: owner,
      });
    }
    this.conversations.set(id, conversation);

    return conversation;
  }

  async getConversation(id: string): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }

  async getConversationsByOwner(owner: string): Promise<Conversation[]> {
    return [...this.conversations.values()].filter((x) => x.owner === owner);
  }

  async getConversationByOwner(owner: string, id: string): Promise<Conversation | undefined> {
    const conversation = this.conversations.get(id);

    if (conversation?.owner !== owner) return;

    return conversation;
  }

  async setCurrentConversation(owner: string, id: string): Promise<void> {
    const user = this.users.get(owner);
    if (!user) throw new Error("User not found");

    user.current_conversation = id;
  }

  async getCurrentConversation(owner: string): Promise<Conversation | undefined> {
    const user = this.users.get(owner);
    if (!user?.current_conversation) return;

    return this.getConversation(user.current_conversation);
  }

  async closeConversation(id: string): Promise<void> {
    this.conversations.delete(id);
  }
}
