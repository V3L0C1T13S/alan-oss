import {
  SlashCommandAttachmentOption,
  SlashCommandBooleanOption,
  SlashCommandChannelOption,
  SlashCommandNumberOption,
  SlashCommandStringOption,
  SlashCommandSubcommandBuilder,
  SlashCommandUserOption,
} from "discord.js";
import { CommandParameter, CommandParameterTypes } from "../../Parameter.js";

export function createParameter(param: CommandParameter) {
  switch (param.type) {
    case CommandParameterTypes.String: {
      const option = new SlashCommandStringOption()
        .setName(param.name)
        .setDescription(param.description)
        .setRequired(!param.optional ?? true);
      if (param.choices) option.addChoices(...param.choices);

      return option;
    }
    case CommandParameterTypes.Bool: {
      const option = new SlashCommandBooleanOption()
        .setName(param.name)
        .setDescription(param.description)
        .setRequired(!param.optional ?? true);

      return option;
    }
    case CommandParameterTypes.Number: {
      const option = new SlashCommandNumberOption()
        .setName(param.name)
        .setDescription(param.description)
        .setRequired(!param.optional ?? true);

      return option;
    }
    case CommandParameterTypes.Channel: {
      const option = new SlashCommandChannelOption()
        .setName(param.name)
        .setDescription(param.description)
        .setRequired(!param.optional ?? true);

      return option;
    }
    case CommandParameterTypes.User: {
      const option = new SlashCommandUserOption()
        .setName(param.name)
        .setDescription(param.description)
        .setRequired(!param.optional ?? true);

      return option;
    }
    case CommandParameterTypes.Attachment: {
      const option = new SlashCommandAttachmentOption()
        .setName(param.name)
        .setDescription(param.description)
        .setRequired(!param.optional ?? true);

      return option;
    }
    case CommandParameterTypes.Subcommand: {
      const option = new SlashCommandSubcommandBuilder()
        .setName(param.name)
        .setDescription(param.description);

      param.subcommands.forEach((subCommand) => {
        const subOption = createParameter(subCommand);
        if (subOption instanceof SlashCommandSubcommandBuilder) return;

        option.options.push(subOption);
      });

      return option;
    }
    default: throw new Error("Unhandled param:", param);
  }
}
