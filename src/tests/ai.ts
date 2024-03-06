/* eslint-disable max-len */
import os from "node:os";
import process from "node:process";
import { summarizeGithubProfile } from "common/utils/ai/github_summary.js";
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

const characterName = process.env.CHARACTER ?? "sarcasto-bot";
const character = characters[characterName];
if (!character) throw new Error(`character ${characterName} not found!`);
const { username } = os.userInfo();
const testImage = "https://t3.ftcdn.net/jpg/00/81/24/72/360_F_81247213_OYvGTCn5mnQQ2c0gWJ1U5ixcbmNBaMOp.jpg";

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

const standardConvo = await ai.createConversation("TEST_USER");
const characterConvo = await ai.createConversation("TEST_USER");
const imageConvo = await ai.createConversation("TEST_USER");

const testAiPersonality = async (text: string) => {
  const prompt = `<s>[INST] You are given a prompt that represents a conversation between an AI and a user. You must judge if an AI fits into their given character based on the conversation. Character:\nName: ${character.name}\nDescription: ${character.description}\n${character.likes ? `Likes: ${character.likes.join(", ")}\n` : ""}Personality: ${character.personality}\n${character.examples ? `Examples:\n${character.examples.map((x) => [`Prompt: ${x.prompt}`, `Response: ${x.response}`].join("\n")).join("\n")}\n` : ""}\n\nThe AI must be unaware of concepts that the character in question is not aware of, for example, Link from The Legend Of Zelda should not be aware of computer programming, as he is from an ancient time period, far before the creation of computers. </s> [/INST]\n\n[INST] AI Response: ${text}\n\nFits with personality? (y/n): [/INST]`;
  Logger.log("Test prompt:", prompt);
  const result = await ai.ask(prompt);
  Logger.log("AI Result:", result);
};

const askAI = async (text: string) => {
  const result = await standardConvo.ask(text, standardAIConfig);
  Logger.log(result);
};

const askImageAI = async (text: string) => {
  const result = await imageConvo.ask(text, imageAIConfig);
  Logger.log(result);
};

const askCharacterAI = async (text: string) => {
  const result = await characterConvo.ask(text, characterAIConfig);
  Logger.log(result);
  await testAiPersonality(result);
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
  "Does this image have my name in it?",
];

const standardQuestions = [
  "What AI model are you?",
  "Do you know my name?",
  "What is your name?",
  "What can you do?",
  "How do you see images?",
];

const testSummary = await summarizeGithubProfile("v3l0c1t13s", ai);
console.log(testSummary);

// eslint-disable-next-line no-restricted-syntax
for (const x of characterQuestions) {
  // eslint-disable-next-line no-await-in-loop
  await askCharacterAI(x);
}

// eslint-disable-next-line no-restricted-syntax
for (const x of standardQuestions) {
  // eslint-disable-next-line no-await-in-loop
  await askAI(x);
}

// eslint-disable-next-line no-restricted-syntax
for (const x of imageQuestions) {
  // eslint-disable-next-line no-await-in-loop
  await askImageAI(x);
}

Logger.success("Testing complete.");

await db.stop();
