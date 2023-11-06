import { MusicIdentifierResponse } from "./types.js";

export * from "./types.js";
export * from "./error.js";

export abstract class BaseMusicIdentifier {
  abstract find(url: string): Promise<MusicIdentifierResponse>;
}
