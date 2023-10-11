import { BaseMusicIdentifier } from "../../model/index.js";
import { MusicIdentifierResponse } from "../../model/types.js";

export class DummyMusicIdentifier extends BaseMusicIdentifier {
  find(url: string): Promise<MusicIdentifierResponse> {
    throw new Error("Method not implemented.");
  }
}
