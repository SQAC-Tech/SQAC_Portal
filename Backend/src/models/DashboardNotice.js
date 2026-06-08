import mongoose from "mongoose";

const dashboardNoticeSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    color: { type: String, default: "#f183ff" },
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export default mongoose.model("DashboardNotice", dashboardNoticeSchema);
