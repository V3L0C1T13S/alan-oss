import { ErrorMessages } from "../../constants/index.js";

export namespace MessageFormatter {
    export function UnsupportedContentType(supportedTypes: string[], givenType?: string) {
      return `${ErrorMessages.UnsupportedContentType} Please use one of the following: ${supportedTypes.join(", ")}`;
    }
}
