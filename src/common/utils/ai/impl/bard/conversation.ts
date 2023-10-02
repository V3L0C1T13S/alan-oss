import { IAskResponseJSON, TAskConfig, TIds } from "bard-ai";
import { Conversation } from "../../model/index.js";

// TODO: pr bard-ai to export this class
declare class Chat {
  ids?: TIds;

  ask(message: string, config?: TAskConfig): Promise<IAskResponseJSON | string>;
  export(): typeof this.ids;
}

export class BardConversation extends Conversation {
  private chat: Chat;

  constructor(id: string, chat: Chat, owner?: string, name?: string) {
    super(id, owner, name);

    this.chat = chat;
  }

  async ask(prompt: string) {
    const response = await this.chat.ask(prompt);

    if (!this.name) this.name = prompt;

    return typeof response === "string" ? response : response.content;
  }
}
