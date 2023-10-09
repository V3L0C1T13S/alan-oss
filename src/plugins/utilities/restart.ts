import { spawn } from "node:child_process";
import { BaseCommand, Logger } from "../../common/index.js";

export default class Restart extends BaseCommand {
  static description = "Restart the bot.";
  static private = true;

  async run() {
    Logger.info(`Restarting due to command from user ${this.author.id}`);

    setTimeout(() => {
      process.on("exit", () => {
        spawn(process.argv.shift()!, process.argv, {
          cwd: process.cwd(),
          detached: true,
          stdio: "inherit",
        });
      });
      process.exit();
    }, 5000);

    return "Restarting.";
  }
}
