import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/index.js";
import { StorableConversation } from "../../generic/index.js";
import { OpenAIManager } from "./index.js";
import { ConversationAskConfig } from "../../model/index.js";
import { Logger } from "../../../logger.js";
import { AIUtils } from "../../text.js";

export class OpenAIConversation extends StorableConversation {
  private manager: OpenAIManager;
  private openai: OpenAI;
  private locked = false;
  private bosToken = "<s>";
  private eosToken = "</s>";

  constructor(manager: OpenAIManager, openai: OpenAI, id: string, owner?: string, name?: string) {
    super(id, manager, owner, name);

    this.manager = manager;
    this.openai = openai;
  }

  private conversationToString() {
    return this.messages.map((x) => `${this.getUserById(x.author)!.name} ${x.content}`).join("\n");
  }

  private generateName() {
    if (!this.name) {
      this.name = "Generating...";
      this.openai.completions.create({
        model: "gpt-3.5-turbo-instruct",
        prompt: `[INST] Create a name for this conversation:\n${this.messages.map((x) => `${this.getUserById(x.author)!.name}: ${x.content}`).join("\n")} [/INST]`,
        max_tokens: 25,
      }).then((nameResponse) => {
        const nameChoice = nameResponse.choices[0];
        if (!nameChoice) return;

        this.name = nameChoice.text;
        Logger.log("name: ", this.name);
      }).catch((e) => Logger.error(e));
    }
  }

  async ask(prompt: string, config?: ConversationAskConfig) {
    if (this.locked) throw new Error("Generation is currently locked.");
    this.locked = true;

    const character = config?.character;

    if (character) {
      const likes = character.likes?.join(", ");
      const dislikes = character.dislikes?.join(", ");
      const username = "<|prompter|>";
      const systemName = "<|system|>";
      // TODO: sometimes, not putting a space in the prompt makes the ai work better
      const basePrompt = `You are a character named ${character.name}, chatting with a user${config.username ? ` named ${config.username}` : ""}.\nA description of your character is this: ${character.description}\nYour character's personality consists of these traits: ${character.personality}\n${likes ? `You like the following: ${likes}\n` : ""}${dislikes ? `You dislike the following: ${dislikes}\n` : ""}${character.examples ? `Conversation examples:\n${character.examples.map((x) => `${username}${x.prompt}\n${systemName}${x.response}`).join("\n")}\n` : ""}`;

      const fullPrompt = `${this.bosToken}[INST] ${AIUtils.replaceVariables(basePrompt, {
        username: config.username,
      })}Conversation History:\n${this.conversationToString()}\n${this.eosToken} [/INST]\n[INST] ${prompt} [/INST]`;
      this.createMessage(prompt, username);
      Logger.log(fullPrompt);
      const completion = await this.openai.completions.create({
        model: "gpt-3.5-turbo-instruct",
        prompt: fullPrompt,
        max_tokens: 256,
        temperature: 0.2,
      });
      const content = completion.choices[0]?.text.trim() ?? "No response.";
      Logger.log("Response:", content);
      try {
        const moderationResult = await this.openai.moderations.create({
          input: prompt,
        });
        const flaggedResult = moderationResult.results[0];
        if (flaggedResult?.flagged) {
          return `Sometimes our models may generate inappropriate content. Debug output:\n${Object.entries(flaggedResult.category_scores).map(([key, result]) => `${key}: ${result}`).join("\n")}\n\nIf you believe this to be a false positive, please [report it.](https://khara.ailsa.ai/report?type=2)\n\n### NOTE: While the filter can still be disabled in NSFW channels, some NSFW is still filtered. [Here's why.](https://support.ailsa.ai/articles/khara/filter#unacceptable-content)`;
        }
      } catch (e) {
        Logger.error(e);
      }

      this.createMessage(content, systemName);
      this.generateName();
      this.locked = false;

      return completion.choices[0]?.text.replaceAll(this.eosToken, "") ?? "No response.";
    }
    const msg = this.createMessage(prompt, "user");

    const stream = this.openai.beta.chat.completions.stream({
      model: "gpt-3.5-turbo",
      messages: this.messages.map((x) => {
        const author = this.getUserById(x.author);
        if (author?.name !== "user" && author?.name !== "assistant") throw new Error("Bad chat fmt");

        const openAIMsg: ChatCompletionMessageParam = {
          role: author.name,
          content: x.content,
        };

        if (author.name === "user" && config?.username) {
          // @ts-ignore
          openAIMsg.name = config?.username;
        }

        if (config?.image && Array.isArray(openAIMsg.content)) {
          if (typeof config.image === "string") {
            openAIMsg.content.push({
              type: "image_url",
              image_url: {
                url: config.image,
              },
            });
          } else {
            Logger.warn("direct image buffers are not supported.");
          }
        }

        return openAIMsg;
      }),
      user: msg.author,
      stream: true,
      // seed: 100,
    });

    stream.on("content", (delta, snapshot) => {
      this.stream.emit("content", delta, snapshot);
    });

    const response = await stream.finalChatCompletion();
    this.stream.emit("finished");

    const choice = response.choices[0];
    if (!choice?.message.content) throw new Error("model generated no choices");

    this.createMessage(choice.message.content, choice.message.role);

    this.generateName();

    this.locked = false;

    return choice.message.content;
  }

  async setConversationTemplate(template: string) {
    return;
  }
}
