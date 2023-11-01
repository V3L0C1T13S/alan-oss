import { aiBackend } from "../../../constants/index.js";
import { BaseDatabaseModel } from "../database/index.js";
import { Logger } from "../logger.js";
import {
  BardAIManager, VercelAIManager, DummyAIManager, LlamaAIManager, ElizaAIManager, AIServerManager,
} from "./impl/index.js";
import { BaseAIManager } from "./model/index.js";

export * from "./impl/index.js";
export * from "./model/index.js";

export function createAIManager(db: BaseDatabaseModel): BaseAIManager {
  switch (aiBackend) {
    case "bard": return new BardAIManager(db);
    case "vercel": return new VercelAIManager(db);
    case "llama": return new LlamaAIManager(db);
    case "eliza": return new ElizaAIManager(db);
    case "aiserver": return new AIServerManager(db);
    default: {
      Logger.error(`Unknown AI backend ${aiBackend}. Using dummy backend.`);

      return new DummyAIManager(db);
    }
  }
}
