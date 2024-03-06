import path from "node:path";
import { existsSync, mkdirSync } from "node:fs";
import { ulid } from "ulid";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import util from "node:util";
import child from "node:child_process";
import { AttachmentBuilder } from "discord.js";
import ffmpeg from "fluent-ffmpeg";
import {
  ErrorMessages, alanTmpDir, vocalRemoverGPU, vocalRemoverPath, vocalRemoverPythonBin,
} from "../../constants/index.js";
import {
  BaseCommand, CommandParameter, CommandParameterTypes, HashCache, Logger,
} from "../../common/index.js";

const execFile = util.promisify(child.execFile);

const instrumentalizePath = path.join(alanTmpDir, "instrumentalize");

type processedSong = {
  instrumentalSong: Buffer,
  vocalSong: Buffer,
}

const cache = new HashCache<processedSong>();

function convertToMp3(songInstrumentalPath: string, outputDir: string, name: string) {
  return new Promise<Buffer>((resolve, reject) => {
    const filePath = path.join(outputDir, name);
    ffmpeg(songInstrumentalPath)
      .format("mp3")
      .save(filePath)
      .on("end", async () => {
        try {
          const data = await readFile(filePath);
          resolve(data);
        } catch (e) {
          Logger.error("Conversion error:", e);
          reject(e);
        }
      })
      .on("err", (err) => reject(err));
  });
}

async function processSongs(
  songInstrumentalPath: string,
  outputDir: string,
  songVocalsPath: string,
  songOutputPath: string,
) {
  if (!vocalRemoverPythonBin || !vocalRemoverPath) throw new Error("Vocal remover python bin and CWD must be specified.");
  await execFile(vocalRemoverPythonBin, [path.join(vocalRemoverPath, "inference.py"), "--input", songOutputPath, "--gpu", vocalRemoverGPU, "-o", outputDir], {
    cwd: vocalRemoverPath,
  });

  const [instrumentalSong, vocalSong] = await Promise.all([convertToMp3(songInstrumentalPath, outputDir, "instrumental.mp3"), convertToMp3(songVocalsPath, outputDir, "vocals.mp3")]);

  return {
    instrumentalSong,
    vocalSong,
  };
}

export default class Instrumentalize extends BaseCommand {
  static description = "Seperate vocals from music.";
  static parameters: CommandParameter[] = [{
    name: "attachment",
    description: "The music to seperate vocals from.",
    type: CommandParameterTypes.Attachment,
    optional: true,
  }, {
    name: "url",
    description: "URL to music to seperate.",
    type: CommandParameterTypes.String,
    optional: true,
  }];

  static async init() {
    if (!existsSync(instrumentalizePath)) mkdirSync(instrumentalizePath, { recursive: true });

    return this;
  }

  async run() {
    const attachment = await this.getFirstAttachment();
    if (!attachment) return ErrorMessages.NeedsAudioOrVideo;
    if (!attachment.proxy_url) return ErrorMessages.UnproxiedAttachment;

    await this.ack();

    const songId = ulid();
    const outputDir = path.join(instrumentalizePath, `songs/${songId}`);
    const songOutputPath = path.join(outputDir, "song");
    const songInstrumentalPath = path.join(outputDir, "song_Instruments.wav");
    const songVocalsPath = path.join(outputDir, "song_Vocals.wav");

    await mkdir(outputDir, { recursive: true });

    const attachmentData = await fetch(attachment.proxy_url);
    const attachmentBuffer = Buffer.from(await attachmentData.arrayBuffer());
    const existingResults = cache.getItem(attachmentBuffer);

    const songResults = existingResults ?? await (async () => {
      await writeFile(songOutputPath, attachmentBuffer);
      const results = await processSongs(
        songInstrumentalPath,
        outputDir,
        songVocalsPath,
        songOutputPath,
      );

      cache.addItem(attachmentBuffer, results);

      return results;
    })();

    const { instrumentalSong, vocalSong } = songResults;

    return {
      files: [new AttachmentBuilder(instrumentalSong)
        .setName("instrumental.mp3"),
      new AttachmentBuilder(vocalSong)
        .setName("vocals.mp3")],
    };
  }
}
