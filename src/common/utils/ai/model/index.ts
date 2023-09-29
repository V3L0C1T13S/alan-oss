import { Conversation } from "./conversation.js";

export * from "./conversation.js";

export abstract class BaseAIManager<initParams = any, promptReturn = string, promptArgs = string> {
  abstract init(initParams: initParams): Promise<void>

  abstract ask(prompt: promptArgs): Promise<promptReturn>

  abstract createConversation(owner?: string): Promise<Conversation>
  abstract getConversation(id: string): Promise<Conversation | undefined>
  abstract getConversationsByOwner(owner: string): Promise<Conversation[]>

  abstract setCurrentConversation(owner: string, id: string): Promise<void>
  abstract getCurrentConversation(owner: string): Promise<Conversation | undefined>

  async getOrCreateCurrentConversation(owner: string): Promise<Conversation> {
    return (await this.getCurrentConversation(owner)) ?? this.createConversation(owner);
  }
}
