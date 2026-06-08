import { Router } from "express";
import {
  getMemberProfile,
  getMemberAttendance,
  getUpcomingMeetings,
  getNotices,
  getDeadlines,
  getProjects,
  getCalendar,
} from "../controllers/dashboard.controller.js";

const router = Router();

// Member
router.get("/member/:id",            getMemberProfile);
router.get("/member/:id/attendance",  getMemberAttendance);

// Meetings
router.get("/meetings/upcoming",     getUpcomingMeetings);

// Notices
router.get("/notices",               getNotices);

// Deadlines
router.get("/deadlines",             getDeadlines);

// Projects
router.get("/projects",              getProjects);

// Calendar
router.get("/calendar/:month/:year", getCalendar);

export default router;
