import { ulid } from "ulid";
import {
  ConversationMessage,
  ConversationUser,
  ConversationData,
} from "../../database/index.js";
import { BaseAIManager, Conversation } from "../model/index.js";

export abstract class StorableConversation extends Conversation {
  protected messages: ConversationMessage[] = [];
  protected users: ConversationUser[] = [];
  protected ai: BaseAIManager;

  constructor(
    id: string,
    manager: BaseAIManager,
    owner?: string,
    name?: string,
    dbConvo?: ConversationData,
  ) {
    super(id, owner, name);

    if (dbConvo) {
      this.name = dbConvo.name;
      this.owner = dbConvo.owner;
      this.messages = dbConvo.messages;
      this.users = dbConvo.users;
    }

    this.ai = manager;
  }

  async save() {
    await this.ai.db.saveConversation({ id: this.id }, this.toStorable());
  }

  protected getUser(name: string) {
    return this.users.find((user) => user.name === name);
  }

  protected getUserById(id: string) {
    return this.users.find((user) => user.id === id);
  }

  protected createMessage(content: string, author: string) {
    const user = this.getUser(author) ?? this.createUser(author);
    const message: ConversationMessage = {
      content,
      author: user.id,
      conversation: this.id,
    };

    this.messages.push(message);

    return message;
  }

  protected createUser(name: string) {
    const user: ConversationUser = {
      name,
      id: ulid(),
    };
    this.users.push(user);

    return user;
  }

  toStorable(): ConversationData {
    if (!this.owner) throw new Error("Storable conversations must have an owner.");

    if (!this.name) this.name = "Unnamed conversation.";

    return {
      id: this.id,
      name: this.name,
      owner: this.owner,
      messages: this.messages,
      users: this.users,
    };
  }
}
