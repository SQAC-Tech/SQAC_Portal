import { Router } from "express";
import {
  getAllProfiles,
  getMembersByStatus,
  updateMemberStatus,
  updateMemberSkills,
  getProfileByEmail,
  upsertProfile,
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
  recommendTeam,
  unassignTeam,
  addSubmission,
  reviewSubmission,
  getDashboardStats,
  getMyProjects,
  postThreadMessage,
  completeProject,
} from "../controllers/project.controller.js";

const router = Router();

// Dashboard Stats
router.get("/stats", getDashboardStats);

// Member Profiles
router.get("/members", getAllProfiles);
router.get("/members/status/:status", getMembersByStatus);
router.put("/members/:id/status", updateMemberStatus);
router.put("/members/:id/skills", updateMemberSkills);
router.get("/members/email/:email", getProfileByEmail);
router.post("/members/upsert", upsertProfile);

// Projects CRUD
router.post("/", createProject);
router.get("/", getAllProjects);
router.get("/my-projects", getMyProjects);
router.get("/:id", getProjectById);
router.put("/:id", updateProject);
router.put("/:id/complete", completeProject);
router.delete("/:id", deleteProject);

// Recommendation Engine
router.post("/:projectId/recommend", recommendTeam);
router.post("/:id/unassign", unassignTeam);

// Submissions & Threads
router.post("/:id/submissions", addSubmission);
router.put("/:id/submissions/:submissionId/review", reviewSubmission);
router.post("/:id/threads", postThreadMessage);

export default router;
