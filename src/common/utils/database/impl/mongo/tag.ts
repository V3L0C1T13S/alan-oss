import { Schema, model } from "mongoose";
import { TagData } from "../../model/index.js";

export const TagSchema = new Schema<TagData>({
  name: String,
  author: String,
  content: String,
});

export const Tag = model("Tag", TagSchema);
