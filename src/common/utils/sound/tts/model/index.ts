export abstract class TTSModel {
  abstract generate(text: string): Promise<Buffer>

  abstract init(): Promise<void>
}
