import child from "child_process";
import util from "util";

const exec = util.promisify(child.exec);

export class Llama {
  binPath: string;

  modelPath: string;

  promptFile?: string;
  stopText?: string;

  constructor(binPath: string, modelPath: string) {
    this.binPath = binPath;
    this.modelPath = modelPath;
  }

  setPromptFile(file: string) {
    this.promptFile = file;
  }

  setStopText(text: string) {
    this.stopText = text;
  }

  async ask(prompt: string): Promise<string> {
    const { stdout } = await exec(`${this.binPath} --simple-io --log-disable -m ${this.modelPath} -n 256 -p "${prompt}"${this.promptFile ? ` -f ${this.promptFile}` : ""}${this.stopText ? ` -r ${this.stopText}` : ""}`);

    return stdout;
  }
}
