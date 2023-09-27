import Whois from "./whois.js";

export default class whoami extends Whois {
  async run() {
    this.args ??= {};
    this.args.users = [this.author];

    return super.run();
  }

  static description = "Get information about yourself";
}
