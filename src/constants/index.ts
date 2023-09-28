import dotenv from "dotenv";

dotenv.config();

export * from "./errors.js";

export const discordToken = process.env.DISCORD_TOKEN;
export const revoltToken = process.env.REVOLT_TOKEN;

export const bardCookie = process.env.BARD_COOKIE;
export const bardPSIDTS = process.env.BARD_PSIDTS;

export const reflectcordAPIURL = process.env.REFLECTCORD_API_URL ?? "http://localhost:3000/api";
export const revoltBaseURL = process.env.REVOLT_BASE_URL ?? "https://api.revolt.chat";
export const revoltAutumnURL = process.env.REVOLT_AUTUMN_URL ?? "https://autumn.revolt.chat";
export const revoltJanuaryURL = process.env.REVOLT_JANUARY_URL ?? "https://january.revolt.chat";
export const botPrefix = process.env.BOT_PREFIX ?? "a!";

export const tiktokSessionId = process.env.TIKTOK_SESSION;

export const discordOwnerId = process.env.DISCORD_OWNER_ID;
export const revoltOwnerId = process.env["REVOLT_OWNER_ID"];

export const botBrand = process.env["BOT_BRAND"] ?? "Alan OSS";
export const botPresence = process.env["PRESENCE"] ?? "online";
export const version = "0.1";
