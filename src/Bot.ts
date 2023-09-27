import {
  ActivityType,
  AttachmentBuilder,
  Client,
  ClientOptions,
  Events,
  GatewayIntentBits,
  Interaction,
  Message,
  Partials,
  PresenceStatusData,
  REST,
  Routes,
  SlashCommandBooleanOption,
  SlashCommandBuilder,
  SlashCommandChannelOption,
  SlashCommandNumberOption,
  SlashCommandStringOption,
  SlashCommandUserOption,
  User,
} from "discord.js";
import { Client as RevoltClient } from "revolt.js/lib/Client.js";
import {
  ErrorMessages,
  botBrand,
  botPrefix,
  botPresence,
  discordToken,
  reflectcordAPIURL,
  revoltBaseURL,
  revoltToken,
  version,
} from "./constants/index.js";
import { PluginManager } from "./managers/index.js";
import parseCommand from "./common/utils/parseCommandV2.js";
import { BaseDatabaseModel, CommandParameterTypes, SqlDatabaseManager } from "./common/index.js";
import { MusicSubsystem } from "./common/utils/music/MusicSubsystem.js";
import { Logger, BaseAIManager, BardAIManager } from "./common/utils/index.js";

export class Bot {
  revoltClient: Client;
  discordClient: Client;
  rawRevoltClient: RevoltClient;

  discordClientOptions: ClientOptions = {
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.DirectMessages,
    ],
    partials: [
      Partials.Channel,
    ],
    presence: {
      status: "idle",
      activities: [{
        type: ActivityType.Custom,
        name: `Starting ${botBrand}...`,
      }],
    },
  };

  pluginManager = new PluginManager(this);

  database!: BaseDatabaseModel;
  aiManager: BaseAIManager = new BardAIManager();

  music: MusicSubsystem = new MusicSubsystem(this);

  constructor() {
    if (!discordToken && !revoltToken) throw new Error("No tokens found.");

    this.discordClient = new Client(this.discordClientOptions);
    this.revoltClient = new Client({
      ...this.discordClientOptions,
      rest: {
        api: reflectcordAPIURL,
      },
    });
    this.rawRevoltClient = new RevoltClient(revoltBaseURL);
  }

  async init() {
    Logger.log(`${botBrand} ${version}`);

    this.setupEvents(this.discordClient);
    this.setupEvents(this.revoltClient);

    this.discordClient.on(Events.ClientReady, (client) => this.discordClientReady(client));

    await this.pluginManager.init();
    this.database = new SqlDatabaseManager(this);
    await this.database.init();
    await this.aiManager.init({});

    await this.login();
  }

  protected async login() {
    if (revoltToken) {
      this.revoltClient.login(revoltToken)
        .catch((e) => Logger.error("Couldn't login to Revolt.", e));
    }
    if (discordToken) {
      this.discordClient.login(discordToken)
        .catch((e) => Logger.error("Couldn't login to Discord.", e));
    }
  }

  // Discord-specific READY since Reflectcord doesn't implement slash commands.
  protected async discordClientReady(client: Client) {
    if (client.token) {
      const rest = new REST().setToken(client.token);

      const interactionCommands = Array.from(this.pluginManager.commands.entries())
        .map(([name, command]) => {
          const slashCmd = new SlashCommandBuilder();

          slashCmd.setName(name);
          slashCmd.setDescription(command.description);
          command.parameters.forEach((param) => {
            try {
              switch (param.type) {
                case CommandParameterTypes.String: {
                  const option = new SlashCommandStringOption()
                    .setName(param.name)
                    .setDescription(param.description)
                    .setRequired(!param.optional ?? true);
                  slashCmd.addStringOption(option);

                  break;
                }
                case CommandParameterTypes.Bool: {
                  const option = new SlashCommandBooleanOption()
                    .setName(param.name)
                    .setDescription(param.description)
                    .setRequired(!param.optional ?? true);
                  slashCmd.addBooleanOption(option);

                  break;
                }
                case CommandParameterTypes.Number: {
                  const option = new SlashCommandNumberOption()
                    .setName(param.name)
                    .setDescription(param.description)
                    .setRequired(!param.optional ?? true);
                  slashCmd.addNumberOption(option);

                  break;
                }
                case CommandParameterTypes.Channel: {
                  const option = new SlashCommandChannelOption()
                    .setName(param.name)
                    .setDescription(param.description)
                    .setRequired(!param.optional ?? true);
                  slashCmd.addChannelOption(option);

                  break;
                }
                case CommandParameterTypes.User: {
                  const option = new SlashCommandUserOption()
                    .setName(param.name)
                    .setDescription(param.description)
                    .setRequired(!param.optional ?? true);
                  slashCmd.addUserOption(option);

                  break;
                }
                default: Logger.error(`Unhandled param type ${param.type}`);
              }
            } catch (e) {
              Logger.error(`Incorrectly formatted param ${param.name} in ${command.name}`, e);
            }
          });

          return slashCmd.toJSON();
        });

      try {
        await rest.put(
          Routes.applicationCommands(this.discordClient.user!.id),
          { body: interactionCommands },
        );

        Logger.success(`Uploaded ${interactionCommands.length} interactions.`);
      } catch (e) {
        Logger.error("Failed to upload interactions.", e);
      }
    }
  }

  protected setupEvents(client: Client) {
    client.on(Events.ClientReady, (c) => this.ready(c));
    client.on(Events.MessageCreate, (message) => this.onMessage(message));
    client.on(Events.InteractionCreate, (interaction) => this.interactionCreate(interaction));
  }

  identifyClient(client: Client) {
    return client === this.revoltClient ? "revolt" : "discord";
  }

  protected ready(client: Client) {
    Logger.log(`${this.identifyClient(client)}: ONLINE!`);

    client.user?.presence.set({
      status: botPresence as PresenceStatusData,
      activities: [{
        name: `${client.guilds.cache.size} Servers - @${client.user.username}`,
        type: ActivityType.Watching,
      }],
    });
  }

  protected async onMessage(message: Message) {
    if (!message.content.startsWith(botPrefix)) return;

    const text = message.content.substring(botPrefix.length);
    const preArgs = text.split(/\s+/g);
    const commandName = preArgs.shift()?.toLowerCase();
    Logger.log("ok", commandName, preArgs);
    if (!commandName) return;

    const Cmd = this.pluginManager.commands.get(commandName);
    if (!Cmd) return;

    await this.database.addCount(commandName);

    Logger.log(await this.database.getCounts());

    const commandClass = new Cmd(this, message.client, {
      message,
      channel: message.channel,
      type: "text",
      clientType: this.identifyClient(message.client),
      args: {
        users: message.mentions.users.toJSON(),
        subcommands: parseCommand(preArgs),
      },
    });

    const errorMsg = await commandClass.run().catch((e) => ({
      content: ErrorMessages.ErrorOccurred,
      files: [new AttachmentBuilder(Buffer.from(`${e}`)).setName("error.txt")],
    }));

    await message.reply(errorMsg).catch((e) => Logger.error(ErrorMessages.ErrorInErrorHandler, e));
  }

  protected async interactionCreate(interaction: Interaction) {
    if (interaction.isCommand()) {
      const { commandName, options } = interaction;
      const Cmd = this.pluginManager.commands.get(commandName);
      if (!Cmd) return;

      const commandClass = new Cmd(this, interaction.client, {
        type: "interaction",
        interaction,
        clientType: this.identifyClient(interaction.client),
        args: {
          users: (await Promise.all(Cmd.parameters
            .filter((x) => x.type === CommandParameterTypes.User)
            .map((x) => interaction.options.getUser(x.name)?.fetch())))
            .filter((x): x is User => !!x),
          subcommands: {},
        },
      });

      const result = await commandClass.run();

      await interaction.reply(result).catch((e) => {
        interaction.reply({
          content: "An error occurred!",
          files: [new AttachmentBuilder(Buffer.from(e)).setName("error.txt")],
        }).catch(Logger.error);
      });
    }
  }
}
