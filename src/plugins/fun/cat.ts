import axios from "axios";
import { EmbedBuilder } from "discord.js";
import {
  BaseCommand, CataasResponse, CommandParameter, CommandParameterTypes,
} from "../../common/index.js";

const cataasURL = "https://cataas.com";
const restrictedCharRegex = /~!\$&@#\*\(\)=:\/,;\?\+/gsi;

export default class Cat extends BaseCommand {
  static description = "Get an image of a cat.";
  static parameters: CommandParameter[] = [{
    name: "text",
    description: "Make the cat say something!",
    optional: true,
    type: CommandParameterTypes.String,
  }];

  async run() {
    const text = this.args?.subcommands?.text?.toString() ?? this.joinArgsToString();
    const cleanText = text?.replaceAll(restrictedCharRegex, "");
    const catInfo = await axios.get<CataasResponse>(`${cataasURL}/cat${cleanText ? `/says/${encodeURIComponent(cleanText)}` : ""}?json=true`);
    const catURL = `${cataasURL}${catInfo.data.url}`;

    const embed = new EmbedBuilder()
      .setTitle("Cat")
      .setImage(catURL)
      .setAuthor({
        name: "Cataas",
        url: cataasURL,
      });

    return {
      embeds: [embed.toJSON()],
    };
  }
}
