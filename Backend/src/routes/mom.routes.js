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

const router = express.Router();

// Member picker — must be before /:id so it isn't swallowed as a param
router.get("/members/approved", getApprovedMembers);

// AI generation
router.post("/ai-generate", generateMOMWithAI);

// MOM CRUD
router.get("/all", getAllMOMs);
router.post("/create", createMOM);
router.get("/:id", getMOMById);
router.put("/:id", updateMOM);
router.delete("/:id", deleteMOM);

export default router;
