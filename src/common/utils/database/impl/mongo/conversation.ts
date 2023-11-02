import { Schema, model } from "mongoose";
import { ConversationData, ConversationMessage, ConversationUser } from "../../model/index.js";

const MessageSchema = new Schema<ConversationMessage>({
  content: String,
  author: String,
  conversation: String,
});

const UserSchema = new Schema<ConversationUser>({
  id: String,
  name: String,
});

export const ConversationSchema = new Schema<ConversationData>({
  users: [UserSchema],
  messages: [MessageSchema],
  name: String,
  owner: String,
  id: String,
});

export const Conversation = model("Conversation", ConversationSchema);
