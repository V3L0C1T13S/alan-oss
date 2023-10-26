import sqlite from "better-sqlite3";
import {
  BaseDatabaseModel, CommandCounts, EditTagData, FindTagData, TagData,
} from "../../model/index.js";
import { Logger } from "../../../logger.js";

const schema = `
CREATE TABLE guilds (
  guild_id VARCHAR(30) NOT NULL PRIMARY KEY,
  prefix VARCHAR(15) NOT NULL,
  disabled text NOT NULL,
  disabled_commands text NOT NULL
);
CREATE TABLE counts (
  command VARCHAR NOT NULL PRIMARY KEY,
  count integer NOT NULL
);
CREATE TABLE tags (
  name text NOT NULL,
  content text NOT NULL,
  author VARCHAR(30) NOT NULL,
  UNIQUE(name)
);
CREATE TABLE settings (
  id smallint PRIMARY KEY,
  broadcast VARCHAR,
  CHECK(id = 1)
);
INSERT INTO settings (id) VALUES (1);
`;

const updates = [
  "", // reserved
  "ALTER TABLE guilds ADD COLUMN accessed int",
  "ALTER TABLE guilds DROP COLUMN accessed",
  `CREATE TABLE settings (
      id smallint PRIMARY KEY,
      broadcast VARCHAR,
      CHECK(id = 1)
    );
    INSERT INTO settings (id) VALUES (1);`,
];

export class SqlDatabaseManager extends BaseDatabaseModel {
  connection: sqlite.Database = sqlite("db.sql");

  async setupSql() {
    const existingCommands = this.connection.prepare("SELECT command FROM counts").all().map((x: any) => x.command);
    const commandNames = [...this.bot.pluginManager.commands.keys()];
    // eslint-disable-next-line no-restricted-syntax
    for (const command of existingCommands) {
      if (!commandNames.includes(command)) {
        this.connection.prepare("DELETE FROM counts WHERE command = ?").run(command);
      }
    }
    // eslint-disable-next-line no-restricted-syntax
    for (const command of commandNames) {
      if (!existingCommands.includes(command)) {
        this.connection.prepare("INSERT INTO counts (command, count) VALUES (?, ?)").run(command, 0);
      }
    }
  }
  async init() {
    this.connection.exec("BEGIN TRANSACTION");

    let version = this.connection.pragma("user_version", { simple: true }) as number;
    const latestVersion = updates.length - 1;

    if (version === 0) {
      Logger.log("initializing sql");
      this.connection.exec(schema);
    } else if (version < latestVersion) {
      Logger.info(`Migrating SQLite database at ${process.env.DB}, which is currently at version ${version}...`);
      while (version < latestVersion) {
        // eslint-disable-next-line no-plusplus
        version++;
        Logger.info(`Running version ${version} update script...`);
        this.connection.exec(updates[version]!);
      }
    } else if (version > latestVersion) {
      throw new Error(`SQLite database is at version ${version}, but this version of the bot only supports up to version ${latestVersion}.`);
    } else {
      return;
    }
    this.connection.pragma(`user_version = ${latestVersion}`);

    this.connection.exec("COMMIT");

    await this.setupSql();
  }

  async addCount(name: string) {
    this.connection.prepare("UPDATE counts SET count = count + 1 WHERE command = ?").run(name);
  }

  async getCounts() {
    const counts: any = this.connection.prepare("SELECT * FROM counts").all();
    const countObject: CommandCounts = {};
    // eslint-disable-next-line no-restricted-syntax
    for (const { command, count } of counts) {
      countObject[command] = count;
    }

    return countObject;
  }

  async addTag(data: TagData): Promise<TagData> {
    throw new Error("Unimplemented");
  }

  async editTag(find: FindTagData, data: EditTagData): Promise<TagData> {
    throw new Error("Unimplemented");
  }

  async getTag(data: FindTagData): Promise<TagData | null> {
    throw new Error("Unimplemented");
  }

  async deleteTag(data: FindTagData) {
    throw new Error("Unimplemented");
  }

  async stop() {
    this.connection.close();
  }
}
