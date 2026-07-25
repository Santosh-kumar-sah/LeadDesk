import rateLimit from "express-rate-limit";

export const leadRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // Limit each IP to 5 lead submissions per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      message: "Too many lead submissions from this IP, please try again after 10 minutes.",
    },
  },
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 login attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      message: "Too many login attempts from this IP, please try again after 15 minutes.",
    },
  },
});
