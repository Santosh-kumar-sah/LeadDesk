import { Router } from "express";
import {
  createLead,
  getLeads,
  updateLeadStatus,
  getLeadById,
} from "../controllers/leadController";
import { validateBody } from "../middleware/validateBody";
import { createLeadSchema, updateStatusSchema } from "../validation/leadSchema";
import { leadRateLimiter } from "../middleware/rateLimiter";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

// Public route
router.post("/", leadRateLimiter, validateBody(createLeadSchema), createLead);

// Protected admin routes
router.get("/", requireAuth, getLeads);
router.get("/:id", requireAuth, getLeadById);
router.patch("/:id/status", requireAuth, validateBody(updateStatusSchema), updateLeadStatus);

export default router;
