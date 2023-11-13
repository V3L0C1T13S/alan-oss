import {
  IAskResponseJSON, TAskConfig, TIds, TImage,
} from "bard-ai";
import { Conversation, ConversationAskConfig } from "../../model/index.js";

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

  async ask(prompt: string, config?: ConversationAskConfig) {
    const bardConfig: TAskConfig = {};
    if (config) {
      const { image } = config;
      const extractedUrl = typeof image === "string"
        ? image.match(/.*?\.(png|jpeg|jpg|webp)/g)?.[0] as TImage
        : undefined;

      if (image) bardConfig.image = extractedUrl ?? image as TImage;
    }

    const response = await this.chat.ask(prompt, bardConfig);

    if (!this.name) this.name = prompt;

    return typeof response === "string" ? response : response.content;
  }

  async setConversationTemplate(template: string) {
    throw new Error("Method not implemented.");
  }
}
