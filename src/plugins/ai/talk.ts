import { AttachmentBuilder, ChannelType, EmbedBuilder } from "discord.js";
import {
  Logger,
  BaseCommand,
  CommandParameter,
  CommandParameterTypes,
  BaseButtonInteractionInfo,
  ConfirmationInteractionInfo,
  createConfirmationInteraction,
  MessageFormatter,
} from "../../common/index.js";
import {
  ErrorMessages,
} from "../../constants/index.js";

const maxMessageLength = 2000;

const tosEmbed = new EmbedBuilder()
  .setTitle("Ailsa TOS agreement")
  .setDescription("Please read these terms carefully.")
  .setFields({
    name: "Content",
    value: "All conversations with our AI services are logged, and used for improving our models, compliance with law, and the safety of our users. By using Ailsa, you understand that your conversations may be viewed by third parties for these purposes.",
  }, {
    name: "Laws & Jurisdiction",
    value: "Ailsa complies with German law. We may suspend your access if you are in violation of these Jurisdiction's laws.",
  }, {
    name: "Active Safety System",
    value: `Our AI services have an active safety system that analyzes and monitors conversations with our models for safety. This system may automatically report content for any of the following:
* Suicide prevention
* Anti-terrorism
* Explicit content depicting minors

In addition to the content itself, the following information about you may be included with the report:
* IP Addresses
* Connected accounts (Google, Discord, Revolt, etc.)
* Context around the content, such as conversation history
* Estimated location
* Audio recordings

These reports may be forwarded to law enforcement, depending on the severity.
Additionally, the system may suspend your access to our services upon repeated offenses.`,
  });

export default class Talk extends BaseCommand {
  static private = false;

  static description = "Talk to the AI.";
  static parameters: CommandParameter[] = [{
    name: "prompt",
    description: "The prompt to send to the AI.",
    type: CommandParameterTypes.String,
    optional: false,
  }, {
    name: "image",
    description: "Send an image to the AI.",
    type: CommandParameterTypes.Attachment,
    optional: true,
  }, {
    name: "url",
    description: "Send a URL of an attachment to the AI.",
    type: CommandParameterTypes.String,
    optional: true,
  }, {
    name: "thread",
    description: "Create a thread for live conversation",
    type: CommandParameterTypes.Bool,
    optional: true,
  }];

  async run() {
    if (!this.args?.subcommands) return ErrorMessages.NotEnoughArgs;

    const prompt = this.args.subcommands.prompt?.toString() ?? this.joinArgsToString();
    const attachment = await this.getFirstAttachment({
      disallowLastMessage: true,
    });
    const url = this.args.subcommands.url?.toString();
    const { thread } = this.args.subcommands;

    const buffer = !url && attachment?.proxy_url
      ? await (await fetch(attachment.proxy_url)).arrayBuffer()
      : undefined;

    if (!prompt) return ErrorMessages.NotEnoughArgs;

    try {
      await this.ack();

      const user = await this.getDbUser();

      if (!user.agreements?.ai_tos) {
        const baseInfo: BaseButtonInteractionInfo = {
          embeds: [tosEmbed.toJSON()],
          buttons: [],
          client_type: this.clientType,
          author: this.author,
        };
        // eslint-disable-next-line no-nested-ternary
        const fullInfo: ConfirmationInteractionInfo | undefined = this.message
          ? { ...baseInfo, message: this.message }
          : this.interaction
            ? { ...baseInfo, interaction: this.interaction! }
            : undefined;

        if (!fullInfo) throw new Error("Info was unable to be created.");

        await createConfirmationInteraction(this.client, {
          ...fullInfo,
          onConfirm: async () => {
            await this.bot.database.updateUser({ id: user.id }, {
              agreements: {
                ai_tos: {
                  agreed_at: new Date().toISOString(),
                },
              },
            });

            return "TOS accepted. You can now use AI features.";
          },
        });

        return null;
      }

      const conversation = await this.bot.aiManager.getOrCreateCurrentConversation(user.id);
      const response = await conversation.ask(prompt, {
        image: url ?? buffer,
        username: this.author.username,
      });

      if (response.length > maxMessageLength) {
        return {
          content: "The AI blew over the length limit. Here's your response.",
          files: [new AttachmentBuilder(Buffer.from(response, "utf-8")).setName("response.txt")],
        };
      }

      if (thread && this.channel?.type === ChannelType.GuildText) {
        try {
          const aiThread = await this.bot.aiThreadManager.createThread(conversation, {
            startMessage: this.message,
            channel: this.channel,
          });

          await aiThread.addMember(this.author);
          const responseMessage = await aiThread.send(response);
          return responseMessage.url;
        } catch (e) {
          Logger.error("Failed to create thread:", e);

          return MessageFormatter.AIThreadCreateError(this.clientType);
        }
      }

      return response;
    } catch (e) {
      Logger.error("AI:", e);
      return ErrorMessages.AIError;
    }
  }
}
