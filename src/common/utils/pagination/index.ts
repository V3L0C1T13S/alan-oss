import {
  APIActionRowComponent,
  APIButtonComponent,
  APIEmbed,
  ButtonStyle,
  Client,
  ComponentType,
  InteractionResponse,
  Message,
  RepliableInteraction,
  User,
} from "discord.js";
import { Logger } from "../logger.js";
import { ClientType } from "../../BaseCommand.js";
import { TextIcon } from "../icons.js";

export type BasePaginationInfo = {
  author: User,
  client_type: ClientType,
  timeout?: number,
}

export type PaginationInfo = BasePaginationInfo & {
    message: Message,
} | BasePaginationInfo & {
    interaction: RepliableInteraction,
}

const defaultTimeoutTime = 12000;

export async function paginate(client: Client, info: PaginationInfo, pages: APIEmbed[]) {
  const components: APIActionRowComponent<APIButtonComponent>[] = [{
    type: ComponentType.ActionRow,
    components: [{
      type: ComponentType.Button,
      label: "Back",
      emoji: {
        name: TextIcon.ButtonBack,
      },
      style: ButtonStyle.Primary,
      custom_id: "back",
    }, {
      type: ComponentType.Button,
      label: "Forward",
      emoji: {
        name: TextIcon.ButtonForward,
      },
      style: ButtonStyle.Primary,
      custom_id: "forward",
    }, {
      type: ComponentType.Button,
      label: "Delete",
      emoji: {
        name: TextIcon.ButtonDelete,
      },
      style: ButtonStyle.Danger,
      custom_id: "delete",
    }],
  }];
  let pageNumber = 0;
  const page = pages[pageNumber];

  let response!: Message | InteractionResponse;

  if (!page) throw new Error("At least 1 page is required.");

  if ("message" in info) {
    response = await info.message.reply({
      embeds: [page],
      components,
    });
  } else if ("interaction" in info) {
    response = info.interaction.deferred ? await info.interaction.followUp({
      embeds: [page],
      components,
    }) : await info.interaction.reply({
      embeds: [page],
      components,
    });
  }

  if (!response) throw new Error("No response?");

  if (pages.length > 1) {
    // TODO (typings)
    const options: any = {};

    if ("message" in info && info.message) options.message = response;
    else if ("interaction" in info && info.interaction) options.interactionResponse = response;

    const collector = response.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: info.timeout ?? defaultTimeoutTime,
    });
    // FIXME (reflectcord) all interaction methods fail
    collector.on("collect", async (interaction) => {
      if (interaction.user.id !== info.author.id) return;

      try {
        // if (!interaction.deferred && !interaction.replied) await interaction.deferReply();
        // FIXME (reflectcord): workaround unimplemented interaction tokens
        if (info.client_type !== "revolt" && !interaction.deferred) await interaction.deferUpdate();

        switch (interaction.customId) {
          case "back": {
            pageNumber = pageNumber > 0 ? pageNumber -= 1 : pages.length - 1;

            break;
          }
          case "forward": {
            pageNumber = pageNumber + 1 < pages.length ? pageNumber + 1 : 0;

            break;
          }
          case "delete": {
            collector.stop();
            try {
              await interaction.deleteReply();
            } catch {
              // nop
            }

            return;
          }
          default: {
            await interaction.editReply(`Unhandled ID ${interaction.customId}`);
          }
        }

        const newPage = pages[pageNumber];
        if (!newPage) {
          await interaction.editReply("Page doesn't exist.");
          return;
        }

        await interaction.editReply({
          embeds: [newPage],
          components,
        });

        collector.resetTimer();
      } catch (e) {
        Logger.error("Error during pagination collector handling:", e);
      }
    });
    collector.on("end", async (_, reason) => {
      if (reason === "messageDelete") return;

      const newPage = pages[pageNumber];
      if (!newPage) return;

      await response.edit({
        embeds: [newPage],
        components: components.map((row) => ({
          ...row,
          components: row.components.map((component) => ({
            ...component,
            disabled: true,
          })),
        })),
      }).catch(Logger.error);
    });
  }
}
