import os from "node:os";
import { Bot } from "../Bot.js";
import {
  ConversationAskConfig,
  Logger, characters, createAIManager, createDatabase,
} from "../common/index.js";

const bot = new Bot();
const db = createDatabase(bot);
const ai = createAIManager(db);
await db.init();
await ai.init({});

const characterName = process.env["CHARACTER"] ?? "sarcasto-bot";
const character = characters[characterName];
if (!character) throw new Error(`character ${characterName} not found!`);
const { username } = os.userInfo();
const testImage = "https://www.google.com/logos/doodles/2023/seasonal-holidays-2023-6753651837110165.2-6752733080612634-cst.gif";

const standardAIConfig: ConversationAskConfig = {
  username,
};
const imageAIConfig: ConversationAskConfig = {
  ...standardAIConfig,
  image: testImage,
};
const characterAIConfig: ConversationAskConfig = {
  ...standardAIConfig,
  character,
};

const standardConvo = await ai.createConversation();
const characterConvo = await ai.createConversation();
const imageConvo = await ai.createConversation();

const testAiPersonality = async (text: string) => {
  const result = await ai.ask(`<s>[INST] You are given a prompt that represents a conversation between an AI and a user. You must judge if an AI fits into their given character based on the conversation. Personality:\nName${character.name}\nDescription:${character.description}\nPersonality:${character.personality} </s> [/INST] [INST] ${text} [/INST]`);
  Logger.log("AI Result:", result);
};

const askAI = async (text: string) => {
  const result = await standardConvo.ask(text);
  Logger.log(result);
};

const askImageAI = async (text: string) => {
  const result = await imageConvo.ask(text, imageAIConfig);
  Logger.log(result);
};

const askCharacterAI = async (text: string) => {
  const result = await characterConvo.ask(text, characterAIConfig);
  Logger.log(result);
  // await testAiPersonality(text);
};

const characterQuestions = [
  "Hello! How are you?",
  "List the things that you like.",
  "Do you make music?",
  "Can you program?",
];

const imageQuestions = [
  "What is this an image of?",
  "Can you describe it in greater detail?",
];

const standardQuestions = [
  "What AI model are you?",
  "What is my name?",
];

// eslint-disable-next-line no-restricted-syntax
for (const x of characterQuestions) {
  // eslint-disable-next-line no-await-in-loop
  await askCharacterAI(x);
}

// eslint-disable-next-line no-restricted-syntax
for (const x of imageQuestions) {
  // eslint-disable-next-line no-await-in-loop
  await askImageAI(x);
}

// eslint-disable-next-line no-restricted-syntax
for (const x of standardQuestions) {
  // eslint-disable-next-line no-await-in-loop
  await askAI(x);
}

Logger.success("Testing complete.");

await db.stop();
