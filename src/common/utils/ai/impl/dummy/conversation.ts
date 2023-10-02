import { Conversation } from "../../model/index.js";

export class DummyConversation extends Conversation {
  async ask(prompt: string) {
    return "Dummy response.";
  }
}
