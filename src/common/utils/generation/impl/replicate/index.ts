import Replicate from "replicate";
import { replicateAPIToken } from "../../../../../constants/index.js";
import {
  GenerationModel,
  GenerateImageParams,
  GenerateVideoParams,
  GenerateMusicParams,
} from "../../model/index.js";

export class ReplicateAIGenerationManager extends GenerationModel {
  private readonly replicate: Replicate;

  constructor() {
    super();

    if (!replicateAPIToken) throw new Error("nah theres no replicated api token :sob:");

    this.replicate = new Replicate({
      auth: replicateAPIToken,
    });
  }

  async generateImage(params: GenerateImageParams) {
    const output = await this.replicate.run(
      "stability-ai/stable-diffusion:ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4",
      {
        input: {
          prompt: params.prompt,
        },
      },
    );

    return {
      url: `${output}`,
    };
  }

  async generateVideo(params: GenerateVideoParams) {
    const output = await this.replicate.run(
      "stability-ai/stable-video-diffusion:3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438",
      {
        input: {
          input_image: params.inputImageURL,
        },
      },
    );

    return {
      url: `${output}`,
    };
  }

  async generateMusic(params: GenerateMusicParams) {
    const output = await this.replicate.run(
      "meta/musicgen:7be0f12c54a8d033a0fbd14418c9af98962da9a86f5ff7811f9b3423a1f0b7d7",
      {
        input: {
          top_k: 250,
          top_p: 0,
          prompt: params.prompt,
          duration: 33,
          temperature: 1,
          continuation: false,
          model_version: "stereo-large",
          output_format: "wav",
          continuation_start: 0,
          multi_band_diffusion: false,
          normalization_strategy: "peak",
          classifier_free_guidance: 3,
        },
      },
    );

    return {
      url: `${output}`,
    };
  }
}
