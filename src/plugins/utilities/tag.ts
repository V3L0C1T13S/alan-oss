import { BaseCommand, CommandParameter, CommandParameterTypes } from "../../common/index.js";
import { ErrorMessages } from "../../constants/index.js";

const tagContentParam: CommandParameter = {
  name: "content",
  description: "Content of the tag.",
  type: CommandParameterTypes.String,
};

export default class Tag extends BaseCommand {
  static description = "Create and manage your tags";
  static parameters: CommandParameter[] = [{
    name: "add",
    description: "Add a new tag.",
    type: CommandParameterTypes.Subcommand,
    subcommands: [{
      name: "name",
      description: "Name of the tag.",
      type: CommandParameterTypes.String,
    }, tagContentParam],
  }, {
    name: "get",
    description: "Get a tag.",
    type: CommandParameterTypes.Subcommand,
    subcommands: [{
      name: "name",
      description: "Name of the tag to get.",
      type: CommandParameterTypes.String,
    }],
  }, {
    name: "edit",
    description: "Edit a tag.",
    type: CommandParameterTypes.Subcommand,
    subcommands: [{
      name: "name",
      description: "Name of the tag to edit.",
      type: CommandParameterTypes.String,
    }, tagContentParam],
  }, {
    name: "remove",
    description: "Remove a tag.",
    type: CommandParameterTypes.Subcommand,
    subcommands: [{
      name: "name",
      description: "Name of the tag to remove.",
      type: CommandParameterTypes.String,
    }],
  }];

  async run() {
    if (!this.args?.subcommands) return ErrorMessages.NotEnoughArgs;

    const {
      add, get, edit, remove,
    } = this.args.subcommands;
    const name = this.args.subcommands.name?.toString();
    const content = this.args.subcommands.content?.toString();
    const authorId = this.author.id;

    if (add) {
      if (!name || !content) return ErrorMessages.NotEnoughArgs;

      await this.bot.database.addTag({
        name,
        content,
        author: authorId,
      });

      return "Created tag.";
    }
    if (get) {
      if (!name) return ErrorMessages.NotEnoughArgs;

      const tag = await this.bot.database.getTag({
        name,
        author: authorId,
      });

      return tag?.content ?? "No tag found.";
    }
    if (edit) {
      if (!name || !content) return ErrorMessages.NotEnoughArgs;

      try {
        await this.bot.database.editTag({
          name,
          author: authorId,
        }, {
          content,
        });

        return "Edited tag.";
      } catch (e) {
        return "Tag not found.";
      }
    }
    if (remove) {
      if (!name) return ErrorMessages.NotEnoughArgs;
      await this.bot.database.deleteTag({
        name,
        author: authorId,
      });

      return "Removed tag.";
    }

    return ErrorMessages.InvalidArgument;
  }
}
