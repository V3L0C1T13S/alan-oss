import {
  GenerateImageParams,
  GenerateImageResult,
  GenerateMusicParams,
  GenerateMusicResult,
  GenerateVideoParams,
  GenerateVideoResult,
} from "./types.js";

export * from "./types.js";

export abstract class GenerationModel {
  abstract generateMusic(params: GenerateMusicParams): Promise<GenerateMusicResult>;
  abstract generateImage(params: GenerateImageParams): Promise<GenerateImageResult>;
  abstract generateVideo(params: GenerateVideoParams): Promise<GenerateVideoResult>;
}
