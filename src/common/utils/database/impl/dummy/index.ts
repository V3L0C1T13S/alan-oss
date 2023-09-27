import { BaseDatabaseModel } from "../../model/index.js";

export class DummyDatabaseManager extends BaseDatabaseModel {
  protected data: Record<string, any> = {
    counts: {},
  };

  async init() {
    console.log("DummyDatabaseInit");
  }

  async getCounts() {
    console.log("getCounts", this.data.counts);

    return this.data["counts"];
  }

  async addCount(name: string) {
    console.log(`addCount ${name}`);
  }

  async stop() {
    console.log("DummyDatabaseStop");
  }
}
