import Bard from "bard-ai";
import { bardCookie, bardPSIDTS } from "../../../../constants/index.js";
import { BaseAIManager } from "../model/index.js";
import { Logger } from "../../logger.js";

type BardPrompt = string;
type BardResponse = string;

export class BardAIManager extends BaseAIManager<any, BardResponse, BardPrompt> {
  private bard: Bard;

  constructor() {
    super();

    if (!bardCookie || !bardPSIDTS) throw new Error("Bard token not specified.");

    this.bard = new Bard({
      "__Secure-1PSID": bardCookie,
      "__Secure-1PSIDTS": bardPSIDTS,
    });
  }

  async init() {
    Logger.success("Using Bard AI backend.");
  }

  async ask(prompt: string) {
    const result = await this.bard.ask(prompt);

    return typeof result === "string" ? result : result.content;
  }
}
