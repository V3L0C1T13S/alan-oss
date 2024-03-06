import { mkdir, rm, writeFile } from "node:fs/promises";
import { ulid } from "ulid";
import path from "node:path";
import { nodewhisper } from "nodejs-whisper";
import {
  Transcription, VoiceRecognitionCapabilities, VoiceRecognitionModel, transcribeParameters,
} from "../../model/index.js";
import { Messages, alanTmpDir } from "../../../../../../constants/index.js";

const dirPath = path.join(alanTmpDir, "audio");
await mkdir(dirPath, { recursive: true });

async function transcribeAudio(params: transcribeParameters, id = ulid()) {
  const filePath = "data" in params ? path.join(dirPath, id) : params.path;

  if ("data" in params) await writeFile(filePath, params.data);

  const model = params.hints?.mode === "fast" ? "base.en" : "large-v1";

  const transcript: string = (await nodewhisper(filePath, {
    modelName: model,
    autoDownloadModelName: model,
    whisperOptions: {
      translateToEnglish: params.hints?.auto_translate ?? false,
    },
  }));
  const trimmed = transcript.trim();

  if ("data" in params) await rm(filePath);

  if (!trimmed?.length) throw new Error(Messages.NoSpeechDetected);

  return trimmed;
}

const transcriptionRegex = /(\[.*\])(.*)/g;

function parseTranscript(transcription: string) {
  const extracted = [...transcription.matchAll(transcriptionRegex)];

  const timestamp = extracted.map((x) => x[1]?.trim()).join("\n").trim();
  const content = extracted.map((x) => x[2]?.trim()).join("\n").trim();
  const text: [string, string][] = extracted
    .filter((x): x is [never, string, string] => !!x[1] && !!x[2])
    .map((x) => [x[1].trim(), x[2].trim()]);

  const textMap = new Map<string, string>();
  text.forEach((x) => {
    textMap.set(x[0], x[1]);
  });

  if (!timestamp || !content) throw new Error("Invalid transcript.");

  const transcript: Transcription = {
    timestamp,
    content,
    text: textMap,
  };

  return transcript;
}

export class WhisperChild extends VoiceRecognitionModel {
  readonly capabilities = [VoiceRecognitionCapabilities.Translation];

  async transcribe(params: transcribeParameters) {
    const transcript = await transcribeAudio(params);
    const extracted = parseTranscript(transcript);

    return extracted;
  }
}
