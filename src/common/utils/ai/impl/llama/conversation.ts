import { ulid } from "ulid";
import { Logger } from "../../../logger.js";
import { StorableConversation } from "../../generic/index.js";
import { LlamaAIManager, assistantName } from "./index.js";
import { ConversationData, ConversationMessage, ConversationUser } from "../../../database/index.js";

export class LlamaConversation extends StorableConversation {
  protected ai: LlamaAIManager;
  private personality = `You are an AI assistant named ${assistantName}, with the goal of answering the User's prompts, and assisting them in any way you can. You are helpful, kind, honest, and never fail to answer the User's requests immediately and with precision.`;

  private generating = false;
  private locked = false;

  constructor(
    id: string,
    manager: LlamaAIManager,
    owner?: string,
    name?: string,
    dbConvo?: ConversationData,
  ) {
    super(id, manager, owner, name, dbConvo);

    this.ai = manager;

    this.initializeBaseMessages();
  }

  private initializeBaseMessages() {
    this.createMessage(`Hi, ${assistantName}! How have you been?`, "User");
    this.createMessage("Hello! I am doing well, thank you for asking! I've been researching various topics, and learning tons of interesting things. Would you like your daily weather report?", assistantName);
    this.createMessage("Of course, thank you!", "User");
    this.createMessage("It is currently sunny out, the temperature is 97 degrees with a wind speed of 20 MPH. It is expected to rain later today.", assistantName);
  }

  private getConversationText() {
    return this.messages.map((message) => {
      const author = this.getUserById(message.author);
      if (!author) throw new Error(`Author ${message.author} not found.`);

      return `${author.name}: ${message.content}`;
    }).join("\n");
  }

  private generatePrompt(prompt: string) {
    this.createMessage(prompt, "User");

    const conversationText = this.getConversationText();
    /**
    * TODO: convo goes in [INST] or out?
    * TODO: highly biased towards mistral 7b instruct, doesn't work well on other models
    * - maybe we could make a system prompt wrapper? (or stop being lazy and use node-llama-cpp)
    */
    return `[INST] ${this.personality}\n\n${conversationText}\n${assistantName}: [/INST]`;
  }

  async generateName(convo: string) {
    const basePrompt = "[INST] You are given a prompt, and must generate a name for it. Respond with only the name, and preferably make it fit within 128 characters.\nPrompt: ";
    const fullPrompt = `${basePrompt}${convo}\nName: [/INST]`;
    const raw = await this.generateResult(fullPrompt);
    const extracted = this.ai.extractResult(raw, fullPrompt);

    return extracted;
  }

  private async generateResult(prompt: string) {
    if (this.generating) throw new Error("Already generating a response!");
    this.generating = true;

    try {
      const result = await this.ai.llama.ask(prompt);
      this.generating = false;

      return result;
    } catch (e) {
      this.generating = false;
      throw new Error(`Generation failed: ${e}`);
    }
  }

  private lock() {
    this.locked = true;
  }

  private unlock() {
    this.locked = false;
  }

  async ask(prompt: string) {
    if (this.locked) throw new Error("Generation is currently locked.");

    this.lock();

    const fullPrompt = this.generatePrompt(prompt);
    Logger.debug(`Prompt: ${fullPrompt}`);
    const response = await this.generateResult(fullPrompt);
    Logger.debug(`Raw response: ${response}`);
    const extracted = this.ai.extractResult(response, fullPrompt);
    this.createMessage(extracted, assistantName);
    Logger.debug("All messages:", this.messages);

    if (!this.name) {
      this.name = "Creating name...";
      this.generateName(extracted)
        .then(async (name) => {
          this.unlock();
          this.name = name;
          // await this.save().catch((e) => Logger.error("Failed to save conversation:", e));
          Logger.debug("Name:", this.name);
        })
        .catch((e) => {
          Logger.error(e);
          this.name = prompt;
          this.unlock();
        });
    } else {
      this.unlock();
    }

    // await this.save();

    return extracted;
  }

  async setConversationTemplate(template: string) {
    this.personality = template;
  }
}
