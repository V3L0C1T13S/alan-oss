import { musicIdentifierBackend } from "constants/index.js";
import { AuddIOMusicIdentifier } from "./impl/auddIO/index.js";
import { BaseMusicIdentifier } from "./model/index.js";

export * from "./model/index.js";

export function createMusicIdentifier(): BaseMusicIdentifier {
  switch (musicIdentifierBackend) {
    case "auddio": return new AuddIOMusicIdentifier();
    default: throw new Error(`Unknown music identifer backend ${musicIdentifierBackend}`);
  }
}
