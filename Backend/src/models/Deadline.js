import mongoose from "mongoose";

const deadlineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    date: { type: String, required: true },           // display string: "Due tomorrow", "Apr 30"
    dueDate: { type: Date, required: true, index: true }, // actual date for sorting
    hot: { type: Boolean, default: false },
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Deadline", deadlineSchema);
