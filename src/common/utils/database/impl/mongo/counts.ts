import { Schema, model } from "mongoose";

export const CountsSchema = new Schema({
  name: String,
  counts: Number,
});

export const Counts = model("Counts", CountsSchema);
