export abstract class BaseAIManager<initParams = any, promptReturn = string, promptArgs = string> {
  abstract init(initParams: initParams): Promise<void>

  abstract ask(prompt: promptArgs): Promise<promptReturn>
}
