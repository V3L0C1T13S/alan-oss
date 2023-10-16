import { Conversation } from "../model/index.js";
import { GenericUser } from "./types.js";

export class GenericAIConversationManager {
  private conversations: Map<string, Conversation> = new Map();
  private users: Map<string, GenericUser> = new Map();

  insertConversation(conversation: Conversation) {
    const { owner } = conversation;
    this.conversations.set(conversation.id, conversation);
    if (owner && !this.users.has(owner)) {
      this.users.set(owner, {
        id: owner,
      });
    }
  }

  getConversation(id: string) {
    return this.conversations.get(id);
  }

  getConversationsByOwner(owner: string) {
    return [...this.conversations.values()].filter((x) => x.owner === owner);
  }

  getConversationByOwner(owner: string, id: string) {
    const conversation = this.conversations.get(id);

    if (conversation?.owner !== owner) return;

    return conversation;
  }

  setCurrentConversation(owner: string, id: string) {
    const user = this.users.get(owner);
    if (!user) throw new Error("User not found");

    user.current_conversation = id;
  }

  getCurrentConversation(owner: string) {
    const user = this.users.get(owner);
    if (!user?.current_conversation) return;

    return this.getConversation(user.current_conversation);
  }

  closeConversation(id: string) {
    this.conversations.delete(id);
  }
}
