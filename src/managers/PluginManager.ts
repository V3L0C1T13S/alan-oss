import { readdirSync } from "node:fs";
import path from "node:path";
import { URL } from "node:url";
import { Bot } from "../Bot.js";
import { Logger, BaseCommandConstructor } from "../common/index.js";

const currentDirectory = new URL(".", import.meta.url).pathname;
const pluginDir = path.join(currentDirectory, "../plugins");

export class PluginManager {
  commands = new Map<string, BaseCommandConstructor>();
  bot: Bot;

  constructor(bot: Bot) {
    this.bot = bot;
  }

  async init() {
    const start = performance.now();

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

    const end = performance.now();
    Logger.success(`Loaded ${this.commands.size} plugins in ${end - start}ms.`);
  }
}
