"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const leadController_1 = require("../controllers/leadController");
const validateBody_1 = require("../middleware/validateBody");
const leadSchema_1 = require("../validation/leadSchema");
const rateLimiter_1 = require("../middleware/rateLimiter");
const requireAuth_1 = require("../middleware/requireAuth");
const router = (0, express_1.Router)();
// Public route
router.post("/", rateLimiter_1.leadRateLimiter, (0, validateBody_1.validateBody)(leadSchema_1.createLeadSchema), leadController_1.createLead);
// Protected admin routes
router.get("/", requireAuth_1.requireAuth, leadController_1.getLeads);
router.get("/:id", requireAuth_1.requireAuth, leadController_1.getLeadById);
router.patch("/:id/status", requireAuth_1.requireAuth, (0, validateBody_1.validateBody)(leadSchema_1.updateStatusSchema), leadController_1.updateLeadStatus);
exports.default = router;
