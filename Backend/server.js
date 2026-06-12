import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./src/lib/db.js";
import { requireRole } from "./src/middleware/role.middleware.js";

// Controllers
import {
  createUser,
  loginUser,
  logoutUser,
  authenticateToken,
  getrole,
} from "./src/controllers/User.controller.js";

import {
  getprofile,
  getotp,
  verifyotp,
  resetpassword,
  editprofile,
  noticeusers,
} from "./src/controllers/role.user.controller.js";

import {
  getmembers,
  getSubAdmins,
  deleteUser,
  deleteSubAdmin,
  changeposition,
  changerole,
  allowmember,
  showstatus,
  rejectmember,
  getpendingmembers,
  getnotices,
  createnotice,
  deletenotice,
  createMeet,
  editMeet,
  deleteMeet,
  getMeet,
  addAttendance,
  getAttendance,
  getALlAttendace,
  editAttendance,
  getAttendanceByDomain,
  getAttendanceByDomainSubdomain
} from "./src/controllers/admin.controller.js";

import certificateRoutes from "./src/routes/certificate.routes.js";
import projectRoutes from "./src/routes/project.routes.js";
import momRoutes from "./src/routes/mom.routes.js";

const app = express();

const allowedOrigins = (process.env.FRONTEND_URL || "")
  .split(",")
  .map((o) => o.trim().replace(/\/$/, ""))
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  credentials: true,
};

// Middleware
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());

// --- Public Routes ---
app.post("/user/create", createUser);
app.post("/user/login", loginUser);
app.post("/logout", logoutUser);

// OTP & Password Reset
app.post("/otp/get", getotp);
app.post("/otp/verify", verifyotp);
app.post("/password/reset", resetpassword);

// Certificates (Public and Protected inside)
app.use("/api/certificate", certificateRoutes);

// --- Protected Routes ---
app.use(authenticateToken); // Apply to all routes below

// User Profile
app.get("/user/profile", getprofile);
app.put("/user/update", editprofile);
app.get("/user/role", getrole);

// Admin Management
app.get("/admin/members", getmembers);
app.get("/admin/subadmins", getSubAdmins);
app.delete("/admin/user/:id", deleteUser);
app.delete("/admin/subadmin/:id", deleteSubAdmin);
app.put("/admin/position/:id", changeposition);
app.put("/admin/role/:id", changerole);
app.post("/admin/approve/:id", allowmember);
app.get("/admin/status/:id", showstatus);
app.post("/admin/reject/:id", rejectmember);
app.get("/admin/pending", getpendingmembers);

//Meetings
app.post("/meet/create", createMeet);
app.put("/meet/edit/:id", editMeet);
app.delete("/meet/delete/:id", deleteMeet);
app.get("/meet/getmeet", getMeet);

// Notices
app.get("/notices", getnotices);
app.post("/notices/create", createnotice);
app.delete("/notices/:id", deletenotice);
app.get("/usernotice/:id", noticeusers);

// Projects & Recommendation Engine
app.use("/api/projects", projectRoutes);

// Minutes of Meeting (MOM)
app.use("/api/mom", momRoutes);

//Attendance
app.post("/attendance/add", requireRole("admin", "subadmin", "lead"), addAttendance);
app.get("/attendance/user/:userID", requireRole("admin", "subadmin", "lead", "user"), getAttendance);
app.get("/attendance/all", requireRole("admin", "subadmin", "lead"), getALlAttendace);
app.put("/attendance/edit/:id", requireRole("admin", "subadmin", "lead"), editAttendance);
app.get("/attendance/domain", requireRole("admin", "subadmin", "lead"), getAttendanceByDomain);
app.get("/attendance/by-domain-subdomain", requireRole("admin", "subadmin", "lead"), getAttendanceByDomainSubdomain);

// Database Connection and Server Start
const PORT = process.env.PORT || 3000;

connectDB()
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });
