import mongoose from "mongoose";

const noticeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  desc: { type: String, required: true },
  Timestamp: {
    type: Date,
    default: Date.now,
  },
  author: String,
  image: String,
  link: String,
  domain: String,
  subDomain: String,
});

export default mongoose.model("Notice", noticeSchema);
