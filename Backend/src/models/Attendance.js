import mongoose from "mongoose";

const monthlyRecordSchema = new mongoose.Schema(
  {
    month: { type: String, required: true },        // e.g. "Nov", "Dec"
    year: { type: Number, required: true },
    attended: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
  },
  { _id: false }
);

const attendanceSchema = new mongoose.Schema(
  {
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    attended: { type: Number, default: 0 },          // cumulative this term
    total: { type: Number, default: 0 },              // cumulative this term
    history: [monthlyRecordSchema],                   // last 6 months
  },
  { timestamps: true }
);

export default mongoose.model("Attendance", attendanceSchema);
