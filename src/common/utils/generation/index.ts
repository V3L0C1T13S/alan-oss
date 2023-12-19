import { generationBackend } from "../../../constants/index.js";
import { ReplicateAIGenerationManager } from "./impl/replicate/index.js";
import { GenerationModel } from "./model/index.js";
import { DummyGenerationManager } from "./impl/dummy/index.js";

export * from "./model/index.js";

export function createGenerationManager(): GenerationModel {
  switch (generationBackend) {
    case "replicate": return new ReplicateAIGenerationManager();
    default: return new DummyGenerationManager();
  }
}
