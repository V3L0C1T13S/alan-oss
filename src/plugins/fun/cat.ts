import axios from "axios";
import { EmbedBuilder } from "discord.js";
import { BaseCommand, CataasResponse } from "../../common/index.js";

const cataasURL = "https://cataas.com";

export default class Cat extends BaseCommand {
  static description = "Get an image of a cat.";

  async run() {
    const catInfo = await axios.get<CataasResponse>(`${cataasURL}/cat?json=true`);

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
