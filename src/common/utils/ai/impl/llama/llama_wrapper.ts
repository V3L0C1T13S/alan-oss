import child from "child_process";
import util from "util";

const execFile = util.promisify(child.execFile);

export class Llama {
  binPath: string;

  modelPath: string;

  promptFile?: string;
  stopText?: string;
  threads?: string;
  ngl?: string;

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

  setThreads(count: string | number) {
    this.threads = count.toString();
  }

  setNgl(layers: string | number) {
    this.ngl = layers.toString();
  }

  async ask(prompt: string): Promise<string> {
    const args: string[] = ["-m", this.modelPath, "--simple-io", "--log-disable", "-n", "24000", "--rope-freq-base", "40000", "-p", prompt];
    if (this.stopText) args.push("-r", this.stopText);
    if (this.promptFile) args.push("-f", this.promptFile);
    if (this.threads) args.push("-t", this.threads);
    if (this.ngl) args.push("-ngl", this.ngl);

    const { stdout } = await execFile(this.binPath, args);

    return stdout;
  }
}
