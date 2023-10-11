import { MusicIdentifierResponse } from "./types.js";

export abstract class BaseMusicIdentifier {
  abstract find(url: string): Promise<MusicIdentifierResponse>;
}
