import OpenAI from "openai";
import { StorableConversation } from "../../generic/index.js";
import { OpenAIManager } from "./index.js";

export class OpenAIConversation extends StorableConversation {
  private manager: OpenAIManager;
  private openai: OpenAI;
  private locked = false;

  constructor(manager: OpenAIManager, openai: OpenAI, id: string, owner?: string, name?: string) {
    super(id, manager, owner, name);

    this.manager = manager;
    this.openai = openai;
  }

  async ask(prompt: string) {
    if (this.locked) throw new Error("Generation is currently locked.");
    this.locked = true;

    const msg = this.createMessage(prompt, "user");

    const stream = this.openai.beta.chat.completions.stream({
      model: "gpt-3.5-turbo",
      // @ts-ignore shut up you're compatible stop crying
      messages: this.messages.map((x) => ({
        role: this.getUserById(x.author)!.name,
        content: x.content,
      })),
      user: msg.author,
      stream: true,
      // seed: 100,
    });

    stream.on("content", (delta, snapshot) => {
      this.stream.emit("content", delta, snapshot);
    });

    const response = await stream.finalChatCompletion();
    this.stream.emit("finished");

    const choice = response.choices[0];
    if (!choice?.message.content) throw new Error("model generated no choices");

    this.createMessage(choice.message.content, choice.message.role);

    if (!this.name) {
      this.name = "Generating...";
      this.openai.completions.create({
        model: "gpt-3.5-turbo-instruct",
        prompt: `Create a name for this conversation:\n${this.messages.map((x) => `${this.getUserById(x.author)!.name}: ${x.content}`).join("\n")}\n\nName:`,
      }).then((nameResponse) => {
        const nameChoice = nameResponse.choices[0];
        if (!nameChoice) return;

        this.name = nameChoice.text;
        console.log("name: ", this.name);
      }).catch((e) => console.error(e));
    }

    this.locked = false;

    return choice.message.content;
  }

  async setConversationTemplate(template: string) {
    return;
  }
}
