import { Schema, model } from "mongoose";
import { Agreement, DbUser } from "../../model/index.js";

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

export const AgreementSchema = new Schema<Agreement>({
  agreed_at: String,
});

export const AgreementsSchema = new Schema({
  ai_tos: {
    type: AgreementSchema,
    required: false,
  },
});

export const UserSchema = new Schema<DbUser>({
  id: String,
  accounts: {
    type: AccountSchema,
    required: false,
  },
  agreements: {
    type: AgreementsSchema,
    required: false,
  },
});

export const User = model("User", UserSchema);
