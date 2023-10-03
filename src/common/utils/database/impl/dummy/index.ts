import { Logger } from "../../../logger.js";
import { BaseDatabaseModel, CommandCounts } from "../../model/index.js";

export class DummyDatabaseManager extends BaseDatabaseModel {
  protected data: CommandCounts = {};

  async init() {
    Logger.info("DummyDatabaseInit");
  }

  async getCounts() {
    return this.data;
  }

  async addCount(name: string) {
    let count = this.data[name];
    if (!count) this.data[name] = 0;
    else count += 1;
  }

  async stop() {
    Logger.info("DummyDatabaseStop");
  }
}
