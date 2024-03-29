import dotenv from "dotenv";
import path from "node:path";
import os from "node:os";
import process from "node:process";

dotenv.config();

export * from "./vocal_remover.js";
export * from "./tts.js";
export * from "./revolt.js";
export * from "./errors.js";

export const maxMessageLength = 1500;
export const supportedTranscribeTypes = ["audio", "video"];

export const discordToken = process.env.DISCORD_TOKEN;
export const revoltToken = process.env.REVOLT_TOKEN;

export const bardCookie = process.env.BARD_COOKIE;
export const bardPSIDTS = process.env.BARD_PSIDTS;

export const palmKey = process.env.PALM_KEY;

export const llamaBin = process.env.LLAMA_BIN;
export const llamaModel = process.env.LLAMA_MODEL;
export const llamaThreads = process.env.LLAMA_THREADS;
export const llamaNGL = process.env.LLAMA_NGL;

export const openAIBaseURL = process.env.OPENAI_BASEURL;
export const openAIToken = process.env.OPENAI_TOKEN;

export const generationBackend = process.env.GENERATION_BACKEND;

export const replicateAPIToken = process.env.REPLICATE_API_TOKEN;

export const vercelSession = process.env.VERCEL_SESSION;
export const vercelPlaygroundId = process.env.VERCEL_PLAYGROUND_ID;

export const tiktokSessionId = process.env.TIKTOK_SESSION;

export const musicIdentifierBackend = process.env.MUSIC_IDENTIFIER_BACKEND ?? "dummy";
export const auddIOToken = process.env.AUDDIO_TOKEN;

export const acrCloudKey = process.env.ACRCLOUD_KEY;
export const acrCloudSecret = process.env.ACRCLOUD_SECRET;
export const acrCloudHost = process.env.ACRCLOUD_HOST;
export const acrCloudBearer = process.env.ACRCLOUD_BEARER;

export const alanTmpDir = path.join(os.tmpdir(), "alan-tmp");

export const tikTokAPIURL = process.env.TIKTOK_API_URL ?? "https://api16-normal-useast5.us.tiktokv.com/media/api/text/speech/invoke";

export const botPrefix = process.env.BOT_PREFIX ?? "a!";

export const aiBackend = process.env.AI_BACKEND ?? "eliza";
export const dbBackend = process.env.DB_BACKEND ?? "sql";

export const mongoURL = process.env.MONGO_URL ?? "mongodb://localhost:27017";

export const discordOwnerId = process.env.DISCORD_OWNER_ID;
export const revoltOwnerId = process.env.REVOLT_OWNER_ID;

export const botBrand = process.env.BOT_BRAND ?? "Alan OSS";
export const botPresence = process.env.PRESENCE ?? "online";
export const version = "0.1";
// Name the assistant goes by.
export const assistantName = process.env.ASSISTANT_NAME ?? botBrand;

// Experiments

export const useVoiceMessageAudio = process.env.USE_VOICEMESSAGE_AUDIO;
