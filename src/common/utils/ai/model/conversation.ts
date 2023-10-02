export abstract class Conversation {
  id: string;
  owner?: string;
  name?: string;

  constructor(id: string, owner?: string, name?: string) {
    this.id = id;
    if (owner) this.owner = owner;
    if (name) this.name = name;
  }

  abstract ask(prompt: string): Promise<string>
}
