import { rvcApiURL, rvcSpeakerName } from "../../../../../../constants/index.js";
import { TTSModel } from "../../model/index.js";

export class RVCTts extends TTSModel {
  async init() {}

  async generate(text: string) {
    const res = await fetch(`${rvcApiURL}/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        speaker_name: rvcSpeakerName,
        input_text: text,
        emotion: "happy",
        speed: 1.0,
      }),
    });

    return Buffer.from(await res.arrayBuffer());
  }
}
