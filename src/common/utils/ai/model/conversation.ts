export abstract class Conversation {
  id: string;
  owner?: string;

  constructor(id: string, owner?: string) {
    this.id = id;
    if (owner) this.owner = owner;
  }

  abstract ask(prompt: string): Promise<string>
}
