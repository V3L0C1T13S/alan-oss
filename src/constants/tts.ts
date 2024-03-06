import dotenv from "dotenv";
import process from "node:process";

dotenv.config();

export const elevenLabsAPIKey = process.env.ELEVENLABS_KEY;
export const elevenLabsVoiceId = process.env.ELEVENLABS_VOICE_ID;
export const playHTId = process.env.PLAYHT_ID;
export const playHTKey = process.env.PLAYHT_KEY;
export const playHtVoiceId = process.env.PLAYHT_VOICE_ID;
export const rvcApiURL = process.env.RVC_API_URL ?? "http://localhost:8000";
export const rvcSpeakerName = process.env.RVC_SPEAKER_NAME ?? "speaker3";

export const ttsBackend = process.env.TTS_BACKEND ?? "rvc";
