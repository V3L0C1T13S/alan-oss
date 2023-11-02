import { Schema, model } from "mongoose";
import { DbUser } from "../../model/index.js";

const AccountSchema = new Schema({
  discord: {
    type: String,
    required: false,
  },
  revolt: {
    type: String,
    required: false,
  },
});

export const UserSchema = new Schema<DbUser>({
  id: String,
  accounts: AccountSchema,
});

export const User = model("User", UserSchema);
