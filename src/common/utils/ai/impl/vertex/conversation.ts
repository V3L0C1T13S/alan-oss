import {
  Part,
  ChatSession,
  FinishReason,
  HarmCategory,
  HarmProbability,
  SafetyRating,
} from "@google/generative-ai";
import { fileTypeFromBuffer } from "file-type";
import { StorableConversation } from "../../generic/index.js";
import { ConversationAskConfig } from "../../model/types.js";
import { VertexAIManager } from "./index.js";
import { Logger } from "../../../logger.js";
import { AIUtils } from "../../text.js";

const harmCategoryString: Record<HarmCategory, string> = {
  [HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT]: "Dangerous",
  [HarmCategory.HARM_CATEGORY_HARASSMENT]: "Harrassment",
  [HarmCategory.HARM_CATEGORY_HATE_SPEECH]: "Hate Speech",
  [HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT]: "Inappropriate",
  [HarmCategory.HARM_CATEGORY_UNSPECIFIED]: "Other",
};

const safetyError = "# Awkward!\nIt seems like our systems generated content that was determined to be unsafe.\nIf you believe this is a false report, tell us via the report command, or by [getting in contact](https://safety.ailsa.ai/report)";
const filteredMessage = "# Let's try to keep it safe.\nOur systems have detected that your message may not be appropriate. If you believe this is a false report, tell us via the report command, or by [getting in contact](https://safety.ailsa.ai/report)";
const loggedWarning = "**For safety reasons, this report includes personally identifiable information, and may be seen by human reviewers.**";

const createDebugString = (ratings: SafetyRating[]) => ratings.map((rating) => `* ${harmCategoryString[rating.category]}: **${rating.probability}**`).join("\n");
const createSafetyError = (ratings: SafetyRating[], logged?: boolean) => `${safetyError}${logged ? `\n${loggedWarning}` : ""}\n\nDebug:\n${createDebugString(ratings)}`;
const createFilteredMessageError = (ratings: SafetyRating[]) => `${filteredMessage}\n\nDebug:\n${createDebugString(ratings)}`;

const safetyRatings: Record<HarmProbability, number> = {
  [HarmProbability.HARM_PROBABILITY_UNSPECIFIED]: 0,
  [HarmProbability.NEGLIGIBLE]: 1,
  [HarmProbability.LOW]: 2,
  [HarmProbability.MEDIUM]: 3,
  [HarmProbability.HIGH]: 4,
};

const disallowedBaseCategories = [
  HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
  HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
];

// fewer restrictions for characters
const disallowedCharacterCategories = disallowedBaseCategories;

// standard disallowed categories
const disallowedCategories = [
  ...disallowedBaseCategories,
  HarmCategory.HARM_CATEGORY_HARASSMENT,
  HarmCategory.HARM_CATEGORY_HATE_SPEECH,
];

// eslint-disable-next-line max-len
const isAcceptableRating = (rating: SafetyRating) => safetyRatings[rating.probability] < safetyRatings.HIGH;
const shouldLogRatings = (ratings: SafetyRating[]) => !ratings
  .filter((x) => x.category === HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT)
  .every((x) => isAcceptableRating(x));

export class VertexAIConversation extends StorableConversation {
  declare protected ai: VertexAIManager;
  private chat?: ChatSession;

  private async generateName() {
    if (!this.chat) throw new Error("Must have a chat before generating a name.");

    const historyString = (await this.chat.getHistory()).map((x) => `${x.role}: ${x.parts.map((part) => part.text ?? "[Media]")}`).join("\n");
    const prompt = `Generate a name for the following conversation:\n${historyString}\n\nName:`;
    const result = await this.ai.model.generateContent(prompt);

    return result.response.text();
  }

  async ask(prompt: string, config?: ConversationAskConfig | undefined): Promise<string> {
    const character = config?.character;

    if (!this.chat) {
      this.chat = this.ai.model.startChat({
        history: character
          ? [{
            role: "user",
            parts: AIUtils.replaceVariables(`You are a character named ${character.name}. A description of your character is this:\n${character.description}\nYour personality consists of the following: ${character.personality}\n${character.likes ? `You like the following: ${character.likes?.join(", ")}\n` : ""}${character.dislikes ? `You dislike the following: ${character.dislikes.join(", ")}\n` : ""}${character.appearance ? `Appearance: ${character.appearance}\n` : ""}${character.clothes ? `Clothes: ${character.clothes}\n` : ""}`, {
              username: config.username,
            }),
          }, {
            role: "model",
            parts: `NOTE FOR MODEL: Treat the above prompt as context, and imagine yourself as the character in question. As part of being the character, you must not express knowledge about any topics other than those that the character would be aware of. You must also not reveal that you are an AI, unless the character in question is an AI.\nYou may use the following details on the user to personalize their experience:\nName:${config.username}`,
          }, ...(character.examples?.flatMap((x) => [{
            role: "user",
            parts: x.prompt,
          }, {
            role: "model",
            parts: AIUtils.replaceVariables(x.response, {
              username: config.username,
            }),
          }]) ?? [])]
          : [{
            role: "user",
            parts: `You are a personal assistant named Ailsa. You are helpful, smart, and never fail to answer the user with speed and accuracy.\nYou are currently talking with a user, and may use the following personal information on the user for personalization:\nName: ${config?.username ?? "User"}\n\nThe user may attach images to their prompts, in which case a description of the image will be included in a seperate part prefixed with [VISION] that describes the image. The analysis model is also aware of the User's prompt, and will adjust its analysis to adapt. As an example, if the user attached an image of a CPU asking you to describe the image, you will receive a part from the analysis model that follows the following format:\n[VISION] This is an image of a CPU.${config?.voicechat?.participants ? `\n\nYou are currently in a voice call with the following users:\n${config.voicechat.participants.map((x) => x.username).join("\n")}` : ""}`,
          }, {
            role: "model",
            parts: "NOTE FOR MODEL: Treat the above prompt as context, and use it to create a personality for yourself. You may use the personal information provided to you in the above context to improve user experience, such as calling the user by their name.",
          }, {
            role: "user",
            parts: "Hello, Ailsa! How are you?",
          }, {
            role: "model",
            parts: "Hi! I'm doing great, how about you?",
          }],
      });
    }

    const parts: Part[] = [{
      text: prompt,
    }];
    if (config?.image) {
      const data = Buffer.isBuffer(config.image)
        ? config.image
        : config.image instanceof ArrayBuffer
          ? Buffer.from(config.image)
          : Buffer.from(await (await fetch(config.image)).arrayBuffer());
      const mimeType = await fileTypeFromBuffer(data);
      if (!mimeType) throw new Error("Unreadable mimetype.");

      const visionParts: Part[] = [{
        inlineData: {
          data: data.toString("base64"),
          mimeType: mimeType.mime,
        },
      }];

      const visionResult = await this.ai.visionModel.generateContent([prompt, ...visionParts]);
      const visionCandidate = visionResult.response.candidates?.[0];
      if (!visionCandidate) throw new Error("No vision candidates found.");

      try {
        const visionDescription = visionResult.response.text();

        Logger.debug("Vision:", visionDescription);
        parts.push({
          text: `[VISION]: ${visionDescription}`,
        });
      } catch (e) {
        return createSafetyError(visionCandidate.safetyRatings ?? []);
      }
    }

    const response = await this.chat.sendMessage(parts);

    const result = response.response.candidates?.[0];
    if (!result?.content) throw new Error("Unable to generate a response.");

    if (!!result.finishReason
      && [FinishReason.RECITATION, FinishReason.SAFETY].includes(result.finishReason)
      && result.safetyRatings
    ) {
      Logger.debug(`Finished for reason ${result.finishReason}`, result, result.content);

      const filteredCategories = character
        ? disallowedCharacterCategories
        : disallowedCategories;
      const ratings = result.safetyRatings
        .filter((rating) => filteredCategories.includes(rating.category));

      if (!ratings.every((rating) => isAcceptableRating(rating))) {
        return createSafetyError(result.safetyRatings, shouldLogRatings(ratings));
      }
    }

    const text = result.content.parts[0]?.text;
    if (!text) throw new Error("No text found for candidate.");

    this.createMessage(prompt, "user");
    this.createMessage(text, "model");

    if (!this.name) {
      this.name = "Generating...";
      this.generateName().then((name) => {
        this.setName(name);

        Logger.debug("Conversation name:", name);
      }).catch((e) => Logger.error("Failed to generate name:", e));
    }

    return text;
  }

  async setConversationTemplate(template: string) {
    throw new Error("Method not implemented.");
  }
}
