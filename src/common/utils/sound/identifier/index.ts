import { Logger } from "../../logger.js";
import { musicIdentifierBackend } from "../../../../constants/index.js";
import { AuddIOMusicIdentifier } from "./impl/auddIO/index.js";
import { DummyMusicIdentifier } from "./impl/dummy/index.js";
import { BaseMusicIdentifier } from "./model/index.js";

export * from "./model/index.js";

export function createMusicIdentifier(): BaseMusicIdentifier {
  switch (musicIdentifierBackend) {
    case "auddio": return new AuddIOMusicIdentifier();
    case "dummy": return new DummyMusicIdentifier();
    default: {
      Logger.error(`Unrecognized audio backend ${musicIdentifierBackend}, using dummy.`);
      return new DummyMusicIdentifier();
    }
  }
}
