import { ClientType } from "../types/index.js";
import { discordOwnerId, revoltOwnerId } from "../../constants/index.js";
import { BaseCommandConstructor } from "../BaseCommand.js";

export function isOwner(id: string, type: ClientType) {
  if (type === "revolt") return id === revoltOwnerId;
  if (type === "discord") return id === discordOwnerId;

  return false;
}

export function canExecuteCommand(userId: string, cmd: BaseCommandConstructor, type: ClientType) {
  if (cmd.private) return isOwner(userId, type);

  return true;
}
