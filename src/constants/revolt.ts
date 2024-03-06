import dotenv from "dotenv";
import process from "node:process";

dotenv.config();

export const reflectcordAPIURL = process.env.REFLECTCORD_API_URL ?? "http://localhost:3000/api";
export const revoltBaseURL = process.env.REVOLT_BASE_URL ?? "https://api.revolt.chat";
export const revoltAutumnURL = process.env.REVOLT_AUTUMN_URL ?? "https://autumn.revolt.chat";
export const revoltJanuaryURL = process.env.REVOLT_JANUARY_URL ?? "https://january.revolt.chat";
