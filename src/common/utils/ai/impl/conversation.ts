import { IAskResponseJSON, TAskConfig, TIds } from "bard-ai";
import { Conversation } from "../model/index.js";

// TODO: pr bard-ai to export this class
declare class Chat {
  ids?: TIds;

  ask(message: string, config?: TAskConfig): Promise<IAskResponseJSON | string>;
  export(): typeof this.ids;
}

export class BardConversation extends Conversation {
  private chat: Chat;

  constructor(id: string, chat: Chat, owner?: string) {
    super(id, owner);

    this.chat = chat;
  }

  async ask(prompt: string) {
    const response = await this.chat.ask(prompt);

    return typeof response === "string" ? response : response.content;
  }
}
