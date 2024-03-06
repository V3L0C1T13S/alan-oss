import { BaseCommand, CommandParameter, CommandParameterTypes } from "../../common/index.js";
import { ErrorMessages } from "../../constants/index.js";

const maxTagNameLength = 64;
const maxTagContentLength = 2048;

const tagContentParam: CommandParameter = {
  name: "content",
  description: "Content of the tag.",
  type: CommandParameterTypes.String,
  maxLength: maxTagContentLength,
};

const tagNameParam: CommandParameter = {
  name: "name",
  description: "Name of the tag.",
  type: CommandParameterTypes.String,
  maxLength: maxTagNameLength,
};

export default class Tag extends BaseCommand {
  static description = "Create and manage your tags";
  static parameters: CommandParameter[] = [{
    name: "add",
    description: "Add a new tag.",
    type: CommandParameterTypes.Subcommand,
    subcommands: [tagNameParam, tagContentParam],
  }, {
    name: "get",
    description: "Get a tag.",
    type: CommandParameterTypes.Subcommand,
    subcommands: [tagNameParam],
  }, {
    name: "edit",
    description: "Edit a tag.",
    type: CommandParameterTypes.Subcommand,
    subcommands: [tagNameParam, tagContentParam],
  }, {
    name: "remove",
    description: "Remove a tag.",
    type: CommandParameterTypes.Subcommand,
    subcommands: [tagNameParam],
  }];

  async run() {
    if (!this.args?.subcommands) return ErrorMessages.NotEnoughArgs;

    const {
      add, get, edit, remove,
    } = this.args.subcommands;
    const name = this.args.subcommands.name?.toString();
    const content = this.args.subcommands.content?.toString();

    const user = await this.getDbUser();
    const authorId = user.id;

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
