import Bard from "bard-ai";
import { ulid } from "ulid";
import { bardCookie, bardPSIDTS } from "../../../../../constants/index.js";
import { BaseAIManager } from "../../model/index.js";
import { Logger } from "../../../logger.js";
import { BardConversation } from "./conversation.js";
import { AIUser, BardPrompt, BardResponse } from "./types.js";

export class BardAIManager extends BaseAIManager<any, BardResponse, BardPrompt> {
  private bard: Bard;

  private conversations: Map<string, BardConversation> = new Map();
  private users: Map<string, AIUser> = new Map();

  constructor() {
    super();

    if (!bardCookie || !bardPSIDTS) throw new Error("Bard token not specified.");

    this.bard = new Bard({
      "__Secure-1PSID": bardCookie,
      "__Secure-1PSIDTS": bardPSIDTS,
    });
  }

  async init() {
    Logger.success("Using Bard AI backend.");
  }

  async ask(prompt: string) {
    const result = await this.bard.ask(prompt);

    return typeof result === "string" ? result : result.content;
  }

  async createConversation(owner?: string) {
    const id = ulid();
    const chat = this.bard.createChat();
    const conversation = new BardConversation(id, chat, owner);

    if (owner && !this.users.get(owner)) {
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
    const conversations = [...this.conversations.values()]
      .filter((c) => c.owner === owner);

    return conversations;
  }

  async getConversationByOwner(owner: string, id: string) {
    const conversation = this.conversations.get(id);

    if (conversation?.owner !== owner) return;

    return conversation;
  }

  async setCurrentConversation(owner: string, id: string): Promise<void> {
    const user = this.users.get(owner);
    if (!user) throw new Error(`User ${owner} does not exist.`);

    const conversation = await this.getConversationByOwner(owner, id);
    if (!conversation) throw new Error(`User ${owner} does not have conversation ${id}`);

    user.current_conversation = id;
  }

  async getCurrentConversation(owner: string) {
    const user = this.users.get(owner);
    if (!user?.current_conversation) return;

    return this.getConversation(user.current_conversation);
  }

  async closeConversation(id: string) {
    this.conversations.delete(id);
  }
}
