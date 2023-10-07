import dotenv from "dotenv";
import path from "node:path";
import os from "node:os";

dotenv.config();

export * from "./errors.js";

export const discordToken = process.env.DISCORD_TOKEN;
export const revoltToken = process.env.REVOLT_TOKEN;

export const bardCookie = process.env.BARD_COOKIE;
export const bardPSIDTS = process.env.BARD_PSIDTS;

export const llamaBin = process.env.LLAMA_BIN;
export const llamaModel = process.env.LLAMA_MODEL;
export const llamaThreads = process.env.LLAMA_THREADS;
export const llamaNGL = process.env.LLAMA_NGL;

export const vercelSession = process.env.VERCEL_SESSION;
export const vercelPlaygroundId = process.env.VERCEL_PLAYGROUND_ID;

export const tiktokSessionId = process.env.TIKTOK_SESSION;

export const alanTmpDir = path.join(os.tmpdir(), "alan-tmp");

export const reflectcordAPIURL = process.env.REFLECTCORD_API_URL ?? "http://localhost:3000/api";
export const revoltBaseURL = process.env.REVOLT_BASE_URL ?? "https://api.revolt.chat";
export const revoltAutumnURL = process.env.REVOLT_AUTUMN_URL ?? "https://autumn.revolt.chat";
export const revoltJanuaryURL = process.env.REVOLT_JANUARY_URL ?? "https://january.revolt.chat";
export const tikTokAPIURL = process.env.TIKTOK_API_URL ?? "https://api16-normal-useast5.us.tiktokv.com/media/api/text/speech/invoke";

export const botPrefix = process.env.BOT_PREFIX ?? "a!";

export const aiBackend = process.env.AI_BACKEND ?? "bard";
export const dbBackend = process.env.DB_BACKEND ?? "sql";

export const mongoURL = process.env.MONGO_URL ?? "mongodb://localhost:27017";

export const discordOwnerId = process.env.DISCORD_OWNER_ID;
export const revoltOwnerId = process.env.REVOLT_OWNER_ID;

export const botBrand = process.env.BOT_BRAND ?? "Alan OSS";
export const botPresence = process.env.PRESENCE ?? "online";
export const version = "0.1";
