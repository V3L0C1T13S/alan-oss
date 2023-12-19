import {
  GenerateImageParams,
  GenerateMediaResult,
  GenerateMusicParams,
  GenerateVideoParams,
  GenerationModel,
} from "../../model/index.js";

export class DummyGenerationManager extends GenerationModel {
  async generateMusic(params: GenerateMusicParams): Promise<GenerateMediaResult> {
    throw new Error("Method not implemented.");
  }

  async generateImage(params: GenerateImageParams): Promise<GenerateMediaResult> {
    throw new Error("Method not implemented.");
  }

  async generateVideo(params: GenerateVideoParams): Promise<GenerateMediaResult> {
    throw new Error("Method not implemented.");
  }
}
