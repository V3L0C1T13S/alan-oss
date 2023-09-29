import { aiBackend } from "../../../constants/index.js";
import { BardAIManager } from "./impl/bard.js";
import { BaseAIManager } from "./model/index.js";

export * from "./impl/index.js";
export * from "./model/index.js";

export function createAIManager(): BaseAIManager {
  switch (aiBackend) {
    case "bard": {
      return new BardAIManager();
    }
    default: {
      throw new Error(`Unknown AI backend ${aiBackend}`);
    }
  }
}
