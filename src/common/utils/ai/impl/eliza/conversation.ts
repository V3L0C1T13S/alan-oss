import ElizaBot from "elizabot";
import { StorableConversation } from "../../generic/index.js";

export class ElizaConversation extends StorableConversation {
  private eliza = new ElizaBot();

  async ask(prompt: string) {
    if (!this.name) this.name = prompt;

    const result = this.eliza.transform(prompt);
    this.createMessage(prompt, "User");
    this.createMessage(result, "Eliza");

    await this.save();

    return result;
  }

  async setConversationTemplate(template: string) {
    throw new Error("Method not implemented.");
  }
}
