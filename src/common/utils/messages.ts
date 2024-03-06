import { ClientType } from "../index.js";
import { ErrorMessages } from "../../constants/index.js";

export namespace MessageFormatter {
  export function UnsupportedContentType(supportedTypes: string[], givenType?: string) {
    return ErrorMessages.UnsupportedContentType
      .replace("{content_type}", givenType ?? "")
      .replace("{supported_types}", supportedTypes.join(", "));
  }

  export function AIThreadCreateError(clientType: ClientType) {
    return `${ErrorMessages.AIThreadCreateError}${clientType === "revolt" ? "\n**This is likely due to Reflectcord not supporting threads.**" : ""}`;
  }

  export function UnsupportedCapability(capability: string) {
    return ErrorMessages.UnsupportedBackendCapability.replace("{capability}", capability);
  }
}
