import { GuildMember, User } from "discord.js";
import { ClientType } from "../../types/index.js";
import { revoltAutumnURL } from "../../../constants/index.js";

export function getUserAvatarURL(user: User | GuildMember, type: ClientType) {
  if (type === "revolt") {
    if (!user.avatar) return;

    return `${revoltAutumnURL}/avatars/${user.avatar}`;
  }

  return user.avatarURL();
}

export function getUserBannerURL(user: User, type: ClientType) {
  if (type === "revolt") {
    if (!user.banner) return;

    return `${revoltAutumnURL}/backgrounds/${user.banner}`;
  }

  return user.bannerURL();
}
