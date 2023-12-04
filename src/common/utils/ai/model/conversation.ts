import { EventEmitter } from "node:events";
import { ConversationAskConfig } from "./types.js";

export abstract class Conversation {
  id: string;
  owner?: string;
  name?: string;
  stream = new EventEmitter();

  constructor(id: string, owner?: string, name?: string) {
    this.id = id;
    if (owner) this.owner = owner;
    if (name) this.name = name;
  }

  abstract ask(prompt: string, config?: ConversationAskConfig): Promise<string>

  abstract setConversationTemplate(template: string): Promise<void>
}
