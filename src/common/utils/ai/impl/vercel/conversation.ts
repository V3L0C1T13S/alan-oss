import { Conversation } from "../../model/index.js";
import { VercelAPI } from "./vercel_api.js";

export class VercelConversation extends Conversation {
  private api: VercelAPI;

  constructor(api: VercelAPI, id: string, owner?: string) {
    super(id, owner);

    this.api = api;
  }

  async ask(prompt: string) {
    return this.api.generate(prompt);
  }
}
