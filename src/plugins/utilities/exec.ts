import child from "node:child_process";
import util from "node:util";
import { BaseCommand, CommandParameter, CommandParameterTypes } from "../../common/index.js";

const exec = util.promisify(child.exec);

export default class Exec extends BaseCommand {
  static private = true;
  static description = "Execute a shell command on the host system.";
  static parameters: CommandParameter[] = [{
    name: "command",
    description: "The command to execute",
    type: CommandParameterTypes.String,
  }];

  async run() {
    await this.ack();

    const command = this.args?.subcommands?.command?.toString() ?? this.joinArgsToString();
    if (!command) return "Give a command to execute!";

    try {
      const { stdout } = await exec(command);

      return stdout;
    } catch (e) {
      return "Error occurred during exec.";
    }
  }
}
