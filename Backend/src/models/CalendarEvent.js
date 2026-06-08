import mongoose from "mongoose";

const calendarEventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    date: { type: Date, required: true, index: true },
    color: { type: String, default: "#f183ff" },
  },
  { timestamps: true }
);

// Compound index for efficient month/year queries
calendarEventSchema.index({ date: 1 });

export default mongoose.model("CalendarEvent", calendarEventSchema);
