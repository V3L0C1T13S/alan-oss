import { ulid } from "ulid";
import { vercelSession, vercelPlaygroundId } from "../../../../../constants/index.js";
import { BaseAIManager } from "../../model/index.js";
import { VercelConversation } from "./conversation.js";
import { VercelAPI } from "./vercel_api.js";
import { Logger } from "../../../logger.js";

type VercelPrompt = string;
type VercelResponse = string;

type VercelUser = {
    id: string,
    current_conversation?: string | null,
}

export class VercelAIManager extends BaseAIManager<any, VercelPrompt, VercelResponse> {
  private api: VercelAPI;

  private conversations: Map<string, VercelConversation> = new Map();

  private users: Map<string, VercelUser> = new Map();

  constructor() {
    super();

    if (!vercelSession || !vercelPlaygroundId) throw new Error("Vercel hasn't been configured.");

    this.api = new VercelAPI(vercelSession, vercelPlaygroundId);
  }

  async init() {
    Logger.warn("You are using Vercel AI, which is known to block users of its API. No support will be provided, you're on your own.");
  }

  async ask(prompt: VercelPrompt) {
    return this.api.generate(prompt);
  }

  async createConversation(owner?: string) {
    const id = ulid();
    const conversation = new VercelConversation(this.api, id, owner);

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

  async setCurrentConversation(owner: string, id: string): Promise<void> {
    const user = this.users.get(owner);
    if (!user) throw new Error(`User ${owner} does not exist.`);

    user.current_conversation = id;
  }

  async getCurrentConversation(owner: string) {
    const user = this.users.get(owner);
    if (!user?.current_conversation) return;

    const current = this.getConversation(user.current_conversation);

    return current;
  }

  async closeConversation(id: string) {
    this.conversations.delete(id);
  }
}
