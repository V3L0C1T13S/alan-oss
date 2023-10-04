import { aiBackend } from "../../../constants/index.js";
import { Logger } from "../logger.js";
import {
  BardAIManager, VercelAIManager, DummyAIManager, LlamaAIManager,
} from "./impl/index.js";
import { BaseAIManager } from "./model/index.js";

export * from "./impl/index.js";
export * from "./model/index.js";

export function createAIManager(): BaseAIManager {
  switch (aiBackend) {
    case "bard": {
      return new BardAIManager();
    }
    case "vercel": {
      return new VercelAIManager();
    }
    case "llama": return new LlamaAIManager();
    default: {
      Logger.error(`Unknown AI backend ${aiBackend}. Using dummy backend.`);

      return new DummyAIManager();
    }
  }
}
