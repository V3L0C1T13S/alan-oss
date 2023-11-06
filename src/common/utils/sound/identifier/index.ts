import { Logger } from "../../logger.js";
import { musicIdentifierBackend } from "../../../../constants/index.js";
import { ACRCloudMusicIdentifier, AuddIOMusicIdentifier, DummyMusicIdentifier } from "./impl/index.js";
import { BaseMusicIdentifier } from "./model/index.js";

export * from "./impl/index.js";
export * from "./model/index.js";

export function createMusicIdentifier(): BaseMusicIdentifier {
  switch (musicIdentifierBackend) {
    case "auddio": return new AuddIOMusicIdentifier();
    case "acrcloud": return new ACRCloudMusicIdentifier();
    case "dummy": return new DummyMusicIdentifier();
    default: {
      Logger.error(`Unrecognized audio backend ${musicIdentifierBackend}, using dummy.`);
      return new DummyMusicIdentifier();
    }
  }
}
