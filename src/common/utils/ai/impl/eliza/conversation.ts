import ElizaBot from "elizabot";
import { Conversation } from "../../model/index.js";

export class ElizaConversation extends Conversation {
  eliza = new ElizaBot();

  async ask(prompt: string) {
    if (!this.name) this.name = prompt;

    return this.eliza.transform(prompt);
  }
}
