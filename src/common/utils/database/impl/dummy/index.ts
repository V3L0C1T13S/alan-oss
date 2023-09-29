import { Logger } from "../../../logger.js";
import { BaseDatabaseModel } from "../../model/index.js";

export class DummyDatabaseManager extends BaseDatabaseModel {
  protected data: Record<string, any> = {
    counts: {},
  };

  async init() {
    Logger.info("DummyDatabaseInit");
  }

  async getCounts() {
    Logger.info("getCounts", this.data.counts);

    return this.data["counts"];
  }

  async addCount(name: string) {
    Logger.info(`addCount ${name}`);
  }

  async stop() {
    Logger.info("DummyDatabaseStop");
  }
}
