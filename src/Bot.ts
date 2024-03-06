import {
  ActivityType,
  ApplicationCommandOptionType,
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
  SlashCommandBuilder,
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
import {
  BaseDatabaseModel, CommandArguments, CommandParameterTypes,
} from "./common/index.js";
import {
  Logger,
  BaseAIManager,
  canExecuteCommand,
  createDatabase,
  createAIManager,
  SoundPlayerManager,
  createParameter,
  createTTSManager,
  createVoiceRecognitionManager,
} from "./common/utils/index.js";
import { AIThreadManager } from "./common/utils/aiThread.js";

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

  database: BaseDatabaseModel;
  aiManager: BaseAIManager;
  soundPlayerManager = new SoundPlayerManager();
  ttsManager = createTTSManager();
  voiceRecognitionManager = createVoiceRecognitionManager();
  aiThreadManager = new AIThreadManager(this);

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

    // DB may expect a fully constructed bot. Create it last.
    this.database = createDatabase(this);
    // AI manager expects db
    this.aiManager = createAIManager(this.database);
  }

  async init() {
    Logger.log(`${botBrand} ${version}`);

    this.setupEvents(this.discordClient);
    this.setupEvents(this.revoltClient);

    this.discordClient.on(Events.ClientReady, (client) => this.discordClientReady(client));

    await this.pluginManager.init();
    await this.database.init();
    await this.aiManager.init({});
    await this.ttsManager.init();

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
              const newOption = createParameter(param);

              slashCmd.options.push(newOption);
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
    client.on(Events.Error, (error) => {
      Logger.error("Client error:", error.message);
    });
    const clientType = this.identifyClient(client);
    const soundPlayer = this.soundPlayerManager.createPlayer(client, clientType);
    try {
      soundPlayer?.connect();
    } catch (e) {
      Logger.error(`Unable to connect ${clientType} to Lavalink:`, e);
    }
  }

  identifyClient(client: Client) {
    return client === this.revoltClient ? "revolt" : "discord";
  }

  protected ready(client: Client) {
    const clientType = this.identifyClient(client);
    Logger.log(`${clientType}: ONLINE!`);

    client.user?.presence.set({
      status: botPresence as PresenceStatusData,
      activities: [{
        name: `Learning from ${client.guilds.cache.size} servers - @${client.user.username}`,
        type: ActivityType.Custom,
      }],
    });
  }

  protected async onMessage(message: Message) {
    try {
      if (message.author.id === message.client.user.id) return;
      if (message.author.bot || message.webhookId) return;
      if (!message.content.startsWith(botPrefix)) return;

      const text = message.content.substring(botPrefix.length);
      const preArgs = text.split(/\s+/g);
      const commandName = preArgs.shift()?.toLowerCase();
      if (!commandName) return;

      const Cmd = this.pluginManager.commands.get(commandName);
      if (!Cmd) return;

      if (!canExecuteCommand(message.author.id, Cmd, this.identifyClient(message.client))) {
        await message.reply(ErrorMessages.DeveloperOnlyCommand);

        return;
      }

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

      const result = await commandClass.execute().catch((e) => ({
        content: ErrorMessages.ErrorOccurred,
        files: [new AttachmentBuilder(Buffer.from(`${e}`)).setName("error.txt")],
      }));

      if (!result) return;

      await message.reply(result).catch((e) => Logger.error(ErrorMessages.ErrorInErrorHandler, e));

      await this.database.addCount(Cmd.name.toLowerCase()).catch((e) => Logger.error(e));
    } catch (e) {
      Logger.error("Error in message handler:", e);
    }
  }

  protected async interactionCreate(interaction: Interaction) {
    if (interaction.isChatInputCommand()) {
      const { commandName, options } = interaction;
      const Cmd = this.pluginManager.commands.get(commandName);
      if (!Cmd) return;

      if (!canExecuteCommand(interaction.user.id, Cmd, this.identifyClient(interaction.client))) {
        await interaction.reply(ErrorMessages.DeveloperOnlyCommand);

        return;
      }

      const subcommands: CommandArguments = {};

      options.data.forEach((option) => {
        switch (option.type) {
          case ApplicationCommandOptionType.Number:
          case ApplicationCommandOptionType.Boolean:
          case ApplicationCommandOptionType.String: {
            if (option.value !== undefined) subcommands[option.name] = option.value;

            break;
          }
          case ApplicationCommandOptionType.Attachment: break;
          case ApplicationCommandOptionType.User: break;
          case ApplicationCommandOptionType.Subcommand: {
            subcommands[option.name] = true;
            option.options?.forEach((subOption) => {
              if (subOption.value !== undefined) subcommands[subOption.name] = subOption.value;
            });
            break;
          }
          default: Logger.error(`Unhandled option type ${option.type}`);
        }
      });

      const commandClass = new Cmd(this, interaction.client, {
        type: "interaction",
        interaction,
        clientType: this.identifyClient(interaction.client),
        args: {
          users: (await Promise.all(Cmd.parameters
            .filter((x) => x.type === CommandParameterTypes.User)
            .map((x) => interaction.options.getUser(x.name)?.fetch())))
            .filter((x): x is User => !!x),
          subcommands,
        },
      });

      const result = await commandClass.execute();

      if (!result) return;

      await (interaction.deferred ? interaction.followUp(result) : interaction.reply(result))
        .catch((e: unknown) => {
          Logger.error("Interaction error:", e);
          interaction.reply({
            content: "An error occurred!",
            files: [new AttachmentBuilder(Buffer.from(`${e}`)).setName("error.txt")],
          }).catch(Logger.error);
        });

      await this.database.addCount(Cmd.name.toLowerCase()).catch((e) => Logger.error(e));
    }
  }
}
