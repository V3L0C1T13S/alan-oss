import axios, { AxiosInstance } from "axios";
import { VercelMessage } from "./message.js";

export class VercelAPI {
  private session: string;
  private playgroundId: string;

  private messages: VercelMessage[] = [];

  private axiosInstance: AxiosInstance;

  constructor(session: string, playgroundId: string) {
    this.session = session;
    this.playgroundId = playgroundId;

    this.axiosInstance = axios.create({
      baseURL: "https://sdk.vercel.ai/api",
    });
  }

  async generate(content: string) {
    const chatIndex = this.messages.push(new VercelMessage("user", content)) - 1;

    const res = await this.axiosInstance.post<string>("/generate", {
      chatIndex: 0,
      maxTokens: 1000,
      messages: this.messages,
      model: "replicate:replicate/llama-2-70b-chat",
      playgroundId: this.playgroundId,
      repititionPenalty: 1,
      temperature: 0.75,
      topP: 1,
    }, {
      headers: {
        accept: "*/*",
        "accept-language": "en-US,en;q=0.9",
        "content-type": "application/json",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "sec-gpc": "1",
        "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36",
        cookie: `user_session: ${this.session}`,
        Referer: "https://sdk.vercel.ai/",
        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
    });

    this.messages.push(new VercelMessage("assistant", res.data));

    return res.data;
  }
}
