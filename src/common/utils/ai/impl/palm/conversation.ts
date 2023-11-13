import { Logger } from "../../../logger.js";
import { Conversation, ConversationAskConfig } from "../../model/index.js";
import { PalmAIManager } from "./index.js";
import { Chat } from "./palm_types.js";

export class PalmConversation extends Conversation {
  private ai: PalmAIManager;
  private chat: Chat;

  private context = "You are an AI assistant named Ailsa, talking to a user.";

  constructor(ai: PalmAIManager, id: string, owner?: string, name?: string) {
    super(id, owner, name);

    this.ai = ai;
    // @ts-ignore
    this.chat = this.ai.palm.createChat({
      context: this.context,
      examples: [
        ["What's your name?", "My name is Ailsa."],
        ["How are you?", "I am doing well, thank you for asking!"],
        ["What technology do you use?", "I use a variety of technologies to assist you, and provide accurate, meaningful responses. Examples include Natural Language Processing (NLP), Knowledge graphs, and Large language models (LLMs)."],
      ],
    });
  }

  async generateName() {
    const messageString = this.chat.export()
      .map((msg) => msg.content).join("\n");

    const name = await this.ai.palm.generateText(`Name the following conversation:\n${messageString}`);

    return name;
  }

  async ask(prompt: string, config?: ConversationAskConfig) {
    const result = await this.chat.ask(prompt);

    if (!this.name) {
      this.name = prompt;
      try {
        this.name = await this.generateName();
      } catch (e) {
        Logger.error("Failed to generate conversation name:", e);
      }
    }

    return result;
  }

  async setConversationTemplate(template: string) {
    return;
  }
}
