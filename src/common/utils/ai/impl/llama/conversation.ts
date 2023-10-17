import { Logger } from "../../../logger.js";
import { Conversation } from "../../model/index.js";
import { LlamaAIManager, assistantName } from "./index.js";

export class LlamaConversation extends Conversation {
  private ai: LlamaAIManager;
  private conversationText?: string;
  private template?: string;

  constructor(id: string, manager: LlamaAIManager, owner?: string, name?: string) {
    super(id, owner, name);

    this.ai = manager;
  }

  async ask(prompt: string) {
    if (!this.name) this.name = prompt;

    const fullPrompt = this.conversationText
      ? `${this.conversationText}${prompt}\n${assistantName}:`
      : this.ai.generatePrompt(prompt, this.template);
    Logger.debug(fullPrompt);
    const response = await this.ai.llama.ask(fullPrompt);
    const extracted = this.ai.extractResult(response, fullPrompt);

    this.conversationText = response;

    return extracted;
  }

  // TODO: refactor literally everything about this backend to support this properly
  async setConversationTemplate(template: string) {
    this.template = template;
  }
}
