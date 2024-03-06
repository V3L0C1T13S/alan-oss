import {
  AttachmentBuilder,
  BaseGuildTextChannel,
  ChannelType,
  GuildTextThreadCreateOptions,
  MessageCreateOptions,
  MessagePayload,
  MessageResolvable,
  ThreadAutoArchiveDuration,
  ThreadChannel,
  UserResolvable,
} from "discord.js";
import { Bot } from "../../Bot.js";
import { Logger } from "./logger.js";
import { Conversation } from "./ai/index.js";
import { maxMessageLength } from "../../constants/index.js";
import { getFirstAttachment } from "./attachment.js";

type AIThreadCreateOptions = {
  startMessage?: MessageResolvable | undefined | null,
  channel: BaseGuildTextChannel,
}

export class AIThread {
  private readonly channel: ThreadChannel;
  private readonly bot: Bot;
  private readonly conversation: Conversation;

  constructor(bot: Bot, channel: ThreadChannel, conversation: Conversation) {
    this.bot = bot;
    this.channel = channel;
    this.conversation = conversation;

    const onNameUpdated = async (name: string) => {
      try {
        await this.channel.setName(name);
      } catch (e) {
        Logger.error("Error ocurred while updating channel name:", e);
      }
    };
    this.conversation.events.on("nameUpdated", onNameUpdated);

    const collector = this.channel.createMessageCollector();
    collector.on("collect", async (message) => {
      try {
        if (!message.content
          || message.author.id === message.client.user.id
          || message.author.bot
        ) return;

        await this.channel.sendTyping();

        const response = await this.conversation.ask(message.content, {
          image: (await getFirstAttachment({ message }))?.proxy_url,
          username: message.author.username,
        });

        await message.reply(response.length > maxMessageLength ? {
          content: "Max length exceeded.",
          files: [new AttachmentBuilder(Buffer.from(response, "utf-8"), {
            name: "response.txt",
          })],
        } : response);
      } catch (e) {
        Logger.error("Cannot generate response:", e);
      }
    });
    collector.on("end", () => {
      try {
        this.conversation.events.removeListener("nameUpdated", onNameUpdated);
      } catch (e) {
        Logger.error("Error disposing listener:", e);
      }
    });
  }

  async addMember(user: UserResolvable) {
    await this.channel.members.add(user);
  }

  async send(options: MessageCreateOptions | MessagePayload | string) {
    return this.channel.send(options);
  }
}

export class AIThreadManager {
  private aiThreads = new Map<string, AIThread>();

  private bot: Bot;

  constructor(bot: Bot) {
    this.bot = bot;
  }

  async createThread(conversation: Conversation, options: AIThreadCreateOptions) {
    const createOptions: GuildTextThreadCreateOptions<ChannelType.PrivateThread> = {
      name: conversation.name ?? "AI Conversation",
      autoArchiveDuration: ThreadAutoArchiveDuration.OneDay,
      reason: "User requested a separate thread for chatting.",
      type: ChannelType.PrivateThread,
      invitable: true,
    };
    if (options.startMessage) createOptions.startMessage = options.startMessage;

    const threadChannel = await options.channel.threads.create(createOptions);

    const thread = new AIThread(this.bot, threadChannel, conversation);
    this.aiThreads.set(threadChannel.id, thread);

    return thread;
  }
}
