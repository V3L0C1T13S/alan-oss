import { Schema, model } from "mongoose";

export const CommandCountSchema = new Schema({
  name: String,
  counts: Number,
});

export const CommandCount = model("CommandCount", CommandCountSchema);
