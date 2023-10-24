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

export interface BaseCommandParameter<T extends CommandParameterTypes> {
  /**
   * @maxlength 32
  * */
  name: string;
  type: T;
  description: string;
  optional?: boolean;
}

export interface ChoiceCommandParameter<
  T extends CommandParameterTypes
> extends BaseCommandParameter<T> {
  choices?: ParameterChoice[],
}

export type StringCommandParameter = ChoiceCommandParameter<CommandParameterTypes.String>;
export type NumberCommandParameter = BaseCommandParameter<CommandParameterTypes.Number>;
export type BoolCommandParameter = BaseCommandParameter<CommandParameterTypes.Bool>;
export type UserCommandParameter = BaseCommandParameter<CommandParameterTypes.User>;
export type ChannelCommandParameter = BaseCommandParameter<CommandParameterTypes.Channel>;
export type AttachmentCommandParameter = BaseCommandParameter<CommandParameterTypes.Attachment>;
export interface SubCommandParameter extends Omit<BaseCommandParameter<CommandParameterTypes.Subcommand>, "optional"> {
  subcommands: BaseCommandParameter<CommandParameterTypes>[]
}

export type CommandParameter = StringCommandParameter
  | NumberCommandParameter
  | BoolCommandParameter
  | UserCommandParameter
  | ChannelCommandParameter
  | AttachmentCommandParameter
  | SubCommandParameter;
