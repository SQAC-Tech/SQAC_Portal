import mongoose from "mongoose";

const dashboardMeetingSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    date: { type: String, required: true },           // display string: "Fri 6 PM"
    scheduledAt: { type: Date, required: true, index: true }, // actual date for sorting/filtering
    color: { type: String, default: "#f183ff" },
  },
  { timestamps: true }
);

export default mongoose.model("DashboardMeeting", dashboardMeetingSchema);
