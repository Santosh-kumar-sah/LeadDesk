import { Router } from "express";
import { login, logout, getMe } from "../controllers/authController";
import { validateBody } from "../middleware/validateBody";
import { loginSchema } from "../validation/authSchema";
import { authRateLimiter } from "../middleware/rateLimiter";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

router.post("/login", authRateLimiter, validateBody(loginSchema), login);
router.post("/logout", logout);
router.get("/me", requireAuth, getMe);

export default router;
