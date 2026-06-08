import User from "../models/User.js";
import Attendance from "../models/Attendance.js";
import DashboardMeeting from "../models/DashboardMeeting.js";
import DashboardNotice from "../models/DashboardNotice.js";
import Deadline from "../models/Deadline.js";
import DashboardProject from "../models/DashboardProject.js";
import CalendarEvent from "../models/CalendarEvent.js";

// ─── GET /api/member/:id ────────────────────────────────────────────────────
export const getMemberProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("name position role");
    if (!user) return res.status(404).json({ error: "Member not found" });

    const names = user.name.trim().split(/\s+/);
    const initials =
      names.length >= 2
        ? (names[0][0] + names[names.length - 1][0]).toUpperCase()
        : names[0].slice(0, 2).toUpperCase();

    res.json({
      _id: user._id,
      name: user.name,
      role: user.position || user.role || "Member",
      initials,
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/member/:id/attendance ─────────────────────────────────────────
export const getMemberAttendance = async (req, res, next) => {
  try {
    const record = await Attendance.findOne({ memberId: req.params.id });
    if (!record) {
      return res.json({ attended: 0, total: 0, history: [] });
    }
    res.json({
      attended: record.attended,
      total: record.total,
      history: record.history,
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/meetings/upcoming ─────────────────────────────────────────────
export const getUpcomingMeetings = async (_req, res, next) => {
  try {
    const meetings = await DashboardMeeting.find({
      scheduledAt: { $gte: new Date() },
    })
      .sort({ scheduledAt: 1 })
      .limit(5)
      .select("name date color");
    res.json(meetings);
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/notices ───────────────────────────────────────────────────────
export const getNotices = async (_req, res, next) => {
  try {
    const notices = await DashboardNotice.find({ active: true })
      .sort({ createdAt: -1 })
      .limit(10)
      .select("text color");
    res.json(notices);
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/deadlines ─────────────────────────────────────────────────────
export const getDeadlines = async (_req, res, next) => {
  try {
    const deadlines = await Deadline.find({ dueDate: { $gte: new Date() } })
      .sort({ dueDate: 1 })
      .limit(10)
      .select("name date hot");
    res.json(deadlines);
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/projects ──────────────────────────────────────────────────────
export const getProjects = async (_req, res, next) => {
  try {
    const projects = await DashboardProject.find()
      .sort({ updatedAt: -1 })
      .limit(10)
      .select("name status pct color statusClass date");
    res.json(projects);
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/calendar/:month/:year ─────────────────────────────────────────
export const getCalendar = async (req, res, next) => {
  try {
    const month = parseInt(req.params.month, 10); // 1-12
    const year = parseInt(req.params.year, 10);

    if (isNaN(month) || isNaN(year) || month < 1 || month > 12) {
      return res.status(400).json({ error: "Invalid month or year" });
    }

    // Fetch events for this month
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    const events = await CalendarEvent.find({
      date: { $gte: startOfMonth, $lte: endOfMonth },
    }).select("date");

    const eventDays = new Set(events.map((e) => new Date(e.date).getDate()));

    // Build calendar grid
    const daysInMonth = new Date(year, month, 0).getDate();
    const firstDayIndex = new Date(year, month - 1, 1).getDay(); // 0=Sun

    // Previous month overflow
    const prevMonthDays = new Date(year, month - 1, 0).getDate();
    const cells = [];

    for (let i = firstDayIndex - 1; i >= 0; i--) {
      cells.push({ n: prevMonthDays - i, other: true });
    }

    // Current month
    const today = new Date();
    const isCurrentMonth =
      today.getMonth() === month - 1 && today.getFullYear() === year;

    for (let d = 1; d <= daysInMonth; d++) {
      const cell = { n: d };
      if (isCurrentMonth && d === today.getDate()) cell.today = true;
      if (eventDays.has(d)) cell.event = true;
      cells.push(cell);
    }

    // Next month overflow to fill 35 cells (5 rows)
    const remaining = 35 - cells.length;
    for (let d = 1; d <= remaining; d++) {
      cells.push({ n: d, other: true });
    }

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];

    res.json({
      month: `${monthNames[month - 1]} ${year}`,
      days: ["S", "M", "T", "W", "T", "F", "S"],
      cells,
    });
  } catch (err) {
    next(err);
  }
};
