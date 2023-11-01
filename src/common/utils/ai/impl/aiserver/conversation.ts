import { Conversation } from "../../model/index.js";
import { AIServerManager } from "./index.js";

export class AIServerConversation extends Conversation {
  private ai: AIServerManager;

  constructor(ai: AIServerManager, id: string, owner?: string) {
    super(id, owner);

    this.ai = ai;
  }

  async ask(prompt: string) {
    return this.ai.ask(prompt);
  }

  async setConversationTemplate(template: string) {
    throw new Error("Method not implemented.");
  }
}
