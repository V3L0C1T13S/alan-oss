import { ulid } from "ulid";
import {
  GoogleGenerativeAI, GenerativeModel, HarmCategory, HarmBlockThreshold,
} from "@google/generative-ai";
import { BaseDatabaseModel } from "../../../database/index.js";
import { Logger } from "../../../logger.js";
import { GenericAIConversationManager } from "../../generic/index.js";
import { BaseAIManager, Conversation } from "../../model/index.js";
import { palmKey } from "../../../../../constants/index.js";
import { VertexAIConversation } from "./conversation.js";

export class VertexAIManager extends BaseAIManager {
  private conversationManager = new GenericAIConversationManager();
  genAI: GoogleGenerativeAI;
  model: GenerativeModel;
  visionModel: GenerativeModel;

  constructor(db: BaseDatabaseModel) {
    super(db);

    if (!palmKey) throw new Error("Please set your Google cloud PaLM key.");

    this.genAI = new GoogleGenerativeAI(palmKey);

    const safetySettings = [{
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    }, {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    }, {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    }];

    this.model = this.genAI.getGenerativeModel({
      model: "gemini-pro",
      safetySettings,
    });
    this.visionModel = this.genAI.getGenerativeModel({
      model: "gemini-pro-vision",
      safetySettings,
    });
  }

  async init(initParams: any) {
    Logger.success("Using Vertex AI");
  }

  async ask(prompt: string) {
    const result = (await this.model.generateContent(prompt))
      .response.candidates?.[0]?.content.parts[0]?.text;
    if (!result) throw new Error("no response generated");

    return result;
  }

  async createConversation(owner?: string | undefined): Promise<Conversation> {
    const convo = new VertexAIConversation(ulid(), this, owner);
    this.conversationManager.insertConversation(convo);

    return convo;
  }

  async getConversation(id: string): Promise<Conversation | undefined> {
    return this.conversationManager.getConversation(id);
  }

  async getConversationByOwner(owner: string, id: string): Promise<Conversation | undefined> {
    return this.conversationManager.getConversationByOwner(owner, id);
  }

  async getConversationsByOwner(owner: string): Promise<Conversation[]> {
    return this.conversationManager.getConversationsByOwner(owner);
  }

  async setCurrentConversation(owner: string, id: string): Promise<void> {
    return this.conversationManager.setCurrentConversation(owner, id);
  }

  async getCurrentConversation(owner: string): Promise<Conversation | undefined> {
    return this.conversationManager.getCurrentConversation(owner);
  }

  async closeConversation(id: string): Promise<void> {
    return this.conversationManager.closeConversation(id);
  }
}
