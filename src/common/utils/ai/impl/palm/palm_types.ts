/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-shadow */
import {
  Format,
  GenerateTextConfig,
  AskConfig,
  ResponseByFormat,
  GenerateTextResponse,
  AskResponse,
  EmbedTextConfig,
  CreateChatConfig,
  ChatAskConfig,
  Message,
} from "palm-api/out/google-ai-types.js";
import PaLM from "palm-api";

export declare class Chat {
  /**
     * `PaLM` instance.
     *
     * @private
     * @type {PaLM}
     */
  private PaLM;
  /**
     * Chat creation configuration.
     *
     * @private
     * @type {CreateChatConfig}
     */
  private config;
  /**
     * Message hystory.
     *
     * @private
     * @type {Message[]}
     */
  private messages;
  /**
     * @constructor
     * @param {PaLM} PaLM
     * @param {Partial<CreateChatConfig>} [rawConfig={}]
     */
  constructor(PaLM: PaLM, rawConfig?: Partial<CreateChatConfig>);
  /**
   * @ts-ignore
     * Same as {@link PaLM.ask()} but remembers previous messages and responses, to enable continued conversations.
     *
     * @async
     * @template {Format} [F='markdown'] response format.
     * @param {string} message
     * @param {Partial<ChatAskConfig<F>>} [rawConfig={}]
     * @returns {Promise<ResponseByFormat<AskResponse>[F]>}
     */
  // @ts-ignore
  ask<F extends Format = "markdown">(message: string, rawConfig?: Partial<ChatAskConfig<F>>): Promise<ResponseByFormat<AskResponse>[F]>;
  /**
     * Exports the message hystory.
     *
     * @returns {Message[]}
     */
  export(): Message[];
}
