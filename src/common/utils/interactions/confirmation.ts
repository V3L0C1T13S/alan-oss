import {
  APIActionRowComponent,
  APIButtonComponent,
  APIEmbed,
  ButtonInteraction,
  ButtonStyle,
  CacheType,
  Client,
  ComponentType,
  InteractionCollector,
  InteractionResponse,
  Message,
  RepliableInteraction,
  User,
} from "discord.js";
import { ClientType } from "../../types/index.js";
import { Logger } from "../logger.js";
import { GenericReply } from "../../BaseCommand.js";

export interface BaseButtonInteractionInfo {
  author: User,
  client_type: ClientType,
  buttons: APIButtonComponent[],
  embeds: APIEmbed[],
  time?: number,
}

export interface MessageButtonInteractionInfo extends BaseButtonInteractionInfo {
    message: Message,
}

export interface RepliableInteractionButtonInteractionInfo extends BaseButtonInteractionInfo {
    interaction: RepliableInteraction,
}

export type ButtonInteractionInfo = MessageButtonInteractionInfo
    | RepliableInteractionButtonInteractionInfo;

const defaultTimeoutTime = 12000;

const confirmId = "confirm";
const cancelId = "cancel";

export async function createButtonInteraction(client: Client, info: ButtonInteractionInfo) {
  const components: APIActionRowComponent<APIButtonComponent>[] = [{
    type: ComponentType.ActionRow,
    components: info.buttons,
  }];

  let response: Message | InteractionResponse | undefined;

  const messageOptions = {
    embeds: info.embeds,
    components,
  };

  if ("message" in info) {
    response = await info.message.reply(messageOptions);
  } else if ("interaction" in info) {
    response = info.interaction.deferred
      ? await info.interaction.followUp(messageOptions)
      : await info.interaction.reply(messageOptions);
  }

  if (!response) throw new Error("Response not created?");

  const collector = response.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: defaultTimeoutTime,
  });
  collector.on("end", async (_, reason) => {
    if (reason === "messageDelete") return;

    await response?.edit({
      components: components.map((row) => ({
        ...row,
        components: row.components.map((component) => ({
          ...component,
          disabled: true,
        })),
      })),
    }).catch(Logger.error);
  });

  return collector;
}

type ConfirmationReply = Exclude<GenericReply, "attachments">

type ConfirmCallback = () => Promise<ConfirmationReply>
type CancelCallback = () => Promise<ConfirmationReply>

export type ConfirmationInteractionInfo = Exclude<ButtonInteractionInfo, "buttons"> & {
  onConfirm?: ConfirmCallback,
  onCancel?: CancelCallback,
}

type ButtonInteractionCollector = InteractionCollector<ButtonInteraction<CacheType>>

class ConfirmationInteractionEmitter {
  private collector: ButtonInteractionCollector;
  private onConfirm: ConfirmCallback | undefined;
  private onCancel: CancelCallback | undefined;

  constructor(collector: ButtonInteractionCollector, events: {
    onConfirm?: ConfirmCallback | undefined,
    onCancel?: CancelCallback | undefined,
  }) {
    this.collector = collector;
    this.onConfirm = events.onConfirm;
    this.onCancel = events.onCancel;

    this.collector.on("collect", async (interaction) => {
      try {
        if (!interaction.deferred) await interaction.deferUpdate();

        switch (interaction.customId) {
          case confirmId: {
            const result = this.onConfirm ? await this.onConfirm() : "Confirmed.";
            // @ts-ignore
            await interaction.editReply(result);

            collector.stop();
            break;
          }
          case cancelId: {
            const result = this.onCancel ? await this.onCancel() : "Cancelled.";
            // @ts-ignore
            await interaction.editReply(result);

            collector.stop();
            break;
          }
          default: throw new Error(`Unhandled id ${interaction.customId}`);
        }
      } catch (e) {
        Logger.error("Error during reply:", e);
      }
    });
  }
}

export async function createConfirmationInteraction(
  client: Client,
  info: ConfirmationInteractionInfo,
) {
  const collector = await createButtonInteraction(client, {
    ...info,
    buttons: [{
      custom_id: confirmId,
      type: ComponentType.Button,
      label: "OK",
      style: ButtonStyle.Success,
    }, {
      custom_id: cancelId,
      type: ComponentType.Button,
      label: "Cancel",
      style: ButtonStyle.Danger,
    }],
  });

  return new ConfirmationInteractionEmitter(collector, {
    onConfirm: info.onConfirm,
    onCancel: info.onCancel,
  });
}
