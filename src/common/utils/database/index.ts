import { Bot } from "../../../Bot.js";
import { dbBackend } from "../../../constants/index.js";
import { Logger } from "../logger.js";
import { DummyDatabaseManager, MongoDbManager, SqlDatabaseManager } from "./impl/index.js";
import { BaseDatabaseModel } from "./model/index.js";

export * from "./impl/index.js";
export * from "./model/index.js";

export function createDatabase(bot: Bot): BaseDatabaseModel {
  switch (dbBackend) {
    case "sql": {
      return new SqlDatabaseManager(bot);
    }
    case "mongo": {
      return new MongoDbManager(bot);
    }
    default: {
      Logger.error(`Invalid DB backend ${dbBackend}. Using dummy backend.`);

      return new DummyDatabaseManager(bot);
    }
  }
}
