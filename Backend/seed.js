import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/User.js";
import Attendance from "./src/models/Attendance.js";
import DashboardMeeting from "./src/models/DashboardMeeting.js";
import DashboardNotice from "./src/models/DashboardNotice.js";
import Deadline from "./src/models/Deadline.js";
import DashboardProject from "./src/models/DashboardProject.js";
import CalendarEvent from "./src/models/CalendarEvent.js";
import bcrypt from "bcryptjs";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/sqac_portal";

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB for seeding");

    // ──────────────────────────────────────────────────────────────────────
    // 2. Attendance
    // ──────────────────────────────────────────────────────────────────────
    await Attendance.deleteMany({ memberId });
    await Attendance.create({
      memberId,
      attended: 12,
      total: 15,
      history: [
        { month: "Nov", year: 2024, attended: 8,  total: 10 },
        { month: "Dec", year: 2024, attended: 6,  total: 8  },
        { month: "Jan", year: 2025, attended: 10, total: 12 },
        { month: "Feb", year: 2025, attended: 9,  total: 11 },
        { month: "Mar", year: 2025, attended: 11, total: 13 },
        { month: "Apr", year: 2025, attended: 12, total: 15 },
      ],
    });
    console.log("  → Attendance seeded");

    // ──────────────────────────────────────────────────────────────────────
    // 3. Upcoming Meetings
    // ──────────────────────────────────────────────────────────────────────
    await DashboardMeeting.deleteMany({});
    const now = new Date();
    await DashboardMeeting.insertMany([
      {
        name: "General body meet",
        date: "Fri 6 PM",
        scheduledAt: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000),
        color: "#f183ff",
      },
      {
        name: "Web Dev sync",
        date: "Sat 11 AM",
        scheduledAt: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
        color: "#81ecff",
      },
      {
        name: "Onboarding session",
        date: "Apr 30",
        scheduledAt: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        color: "#fbbf24",
      },
    ]);
    console.log("  → Meetings seeded");

    // ──────────────────────────────────────────────────────────────────────
    // 4. Notices
    // ──────────────────────────────────────────────────────────────────────
    await DashboardNotice.deleteMany({});
    await DashboardNotice.insertMany([
      { text: "General body meeting rescheduled to Friday, 6 PM", color: "#fbbf24" },
      { text: "New domain member onboarding session — Apr 30",    color: "#a78bfa" },
      { text: "SQAC Portal v2 is live · share feedback in #dev",  color: "#22c55e" },
    ]);
    console.log("  → Notices seeded");

    // ──────────────────────────────────────────────────────────────────────
    // 5. Deadlines
    // ──────────────────────────────────────────────────────────────────────
    await Deadline.deleteMany({});
    await Deadline.insertMany([
      {
        name: "Workshop slide deck",
        date: "Due tomorrow",
        dueDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000),
        hot: true,
        memberId,
      },
      {
        name: "MOM — April sprint",
        date: "Apr 30",
        dueDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        hot: false,
        memberId,
      },
      {
        name: "Website redesign PR",
        date: "May 5",
        dueDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
        hot: false,
        memberId,
      },
    ]);
    console.log("  → Deadlines seeded");

    // ──────────────────────────────────────────────────────────────────────
    // 6. Dashboard Projects
    // ──────────────────────────────────────────────────────────────────────
    await DashboardProject.deleteMany({});
    await DashboardProject.insertMany([
      { name: "Portal v2 — Web Dev",   status: "Active",  pct: 75, color: "#a78bfa", statusClass: "s-active",  memberId },
      { name: "Workshop content",       status: "Pending", pct: 40, color: "#fbbf24", statusClass: "s-pending", memberId },
      { name: "Recruitment drive",      status: "Review",  pct: 90, color: "#22c55e", statusClass: "s-review",  memberId },
      { name: "Hackathon registration", status: "Active",  pct: 55, color: "#f183ff", statusClass: "s-active",  memberId },
      { name: "MOM — April sprint",     status: "Pending", pct: 20, color: "#f87171", statusClass: "s-pending", memberId },
    ]);
    console.log("  → Projects seeded");

    // ──────────────────────────────────────────────────────────────────────
    // 7. Calendar Events (April 2025)
    // ──────────────────────────────────────────────────────────────────────
    await CalendarEvent.deleteMany({});
    await CalendarEvent.insertMany([
      { title: "Workshop",          date: new Date(2025, 3, 3),  color: "#f183ff" },
      { title: "Hackathon kickoff", date: new Date(2025, 3, 11), color: "#81ecff" },
      { title: "Design review",     date: new Date(2025, 3, 16), color: "#fbbf24" },
      { title: "Sprint retro",      date: new Date(2025, 3, 25), color: "#a78bfa" },
      { title: "Monthly wrap-up",   date: new Date(2025, 3, 30), color: "#22c55e" },
    ]);
    console.log("  → Calendar events seeded");

    console.log("\n🎉 Seed completed successfully!");
    console.log(`   Member ID for testing: ${memberId}`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  }
}

seed();
