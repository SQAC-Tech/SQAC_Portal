import express from "express";
import {
  createMOM,
  getAllMOMs,
  getMOMById,
  updateMOM,
  deleteMOM,
  generateMOMWithAI,
  getApprovedMembers,
} from "../controllers/mom.controller.js";
import { requireRole } from "../middleware/role.middleware.js";

const router = express.Router();

// Member picker — must be before /:id so it isn't swallowed as a param
router.get("/members/approved", getApprovedMembers);

// AI generation
router.post("/ai-generate", requireRole("admin", "subadmin", "lead"), generateMOMWithAI);

// MOM CRUD
router.get("/all", getAllMOMs);
router.post("/create", requireRole("admin", "subadmin", "lead"), createMOM);
router.get("/:id", getMOMById);
router.put("/:id", requireRole("admin", "subadmin", "lead"), updateMOM);
router.delete("/:id", requireRole("admin", "subadmin", "lead"), deleteMOM);

export default router;
