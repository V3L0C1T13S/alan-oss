import { APIVercelMessage, APIVercelMessageType } from "./types.js";

export class VercelMessage implements APIVercelMessage {
  role: APIVercelMessageType;
  content: string;

  constructor(role: APIVercelMessageType, content: string) {
    this.role = role;
    this.content = content;
  }
}
