export enum CommandParameterTypes {
  String = 0,
  Number = 1,
  Bool = 2,
  User = 3,
  Channel = 4,
  Attachment = 5,
  Subcommand = 6,
}

export interface ParameterChoice {
  name: string,
  value: string,
}

export interface BaseCommandParameter {
  /**
   * @maxlength 32
  * */
  name: string;
  type: CommandParameterTypes;
  description: string;
  optional?: boolean;
  choices?: ParameterChoice[],
}

export interface SubCommandParameter extends Omit<BaseCommandParameter, "optional"> {
  type: CommandParameterTypes.Subcommand,
  subcommands: BaseCommandParameter[]
}

export type CommandParameter = BaseCommandParameter | SubCommandParameter;
