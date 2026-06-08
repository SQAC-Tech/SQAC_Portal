import mongoose from "mongoose";

const dashboardProjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    status: {
      type: String,
      enum: ["Active", "Pending", "Review", "Completed"],
      default: "Active",
    },
    pct: { type: Number, default: 0, min: 0, max: 100 },
    color: { type: String, default: "#a78bfa" },
    statusClass: {
      type: String,
      enum: ["s-active", "s-pending", "s-review", "s-completed"],
      default: "s-active",
    },
    date: { type: String, default: "" },               // display string: "Tomorrow", "May 5"
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("DashboardProject", dashboardProjectSchema);
