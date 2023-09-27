import { readdirSync } from "fs";
import path from "path";
import { URL } from "url";
import { Bot } from "../Bot.js";
import { Logger, BaseCommandConstructor } from "../common/index.js";

const __dirname = new URL(".", import.meta.url).pathname;
const pluginDir = path.join(__dirname, "../plugins");

export class PluginManager {
  commands = new Map<string, BaseCommandConstructor>();
  bot: Bot;

  constructor(bot: Bot) {
    this.bot = bot;
  }

  async init() {
    const categories = readdirSync(pluginDir);

    await Promise.all(categories.map(async (category) => {
      const plugins = readdirSync(path.join(pluginDir, category));

      await Promise.all(plugins.map(async (file) => {
        const { name } = path.parse(file);
        if (file.endsWith(".map")) return;

        try {
          const plugin: BaseCommandConstructor = (await import(
            path.join(pluginDir, category, file),
          )).default;

          plugin.category = category;
          await plugin.init({
            bot: this.bot,
          });

          this.commands.set(name, plugin);
        } catch (e) {
          Logger.error(`Error occurred during command initialization for ${name}`, e);
        }
      }));
    }));
  }
}
