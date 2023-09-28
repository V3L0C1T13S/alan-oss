export type CommandParameterType = "string" | "number" | "bool" | "user" | "channel"

export enum CommandParameterTypes {
  String = 0,
  Number = 1,
  Bool = 2,
  User = 3,
  Channel = 4,
  Attachment = 5,
}

export interface CommandParameter {
    /**
     * @maxlength 32
    * */
    name: string;
    type: CommandParameterTypes;
    description: string;
    optional?: boolean;
}
