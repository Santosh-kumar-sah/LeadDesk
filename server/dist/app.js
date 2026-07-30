"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const leadRoutes_1 = __importDefault(require("./routes/leadRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const errorHandler_1 = require("./middleware/errorHandler");
const app = (0, express_1.default)();
// Trust proxy for Render / Cloudflare / Vercel reverse proxies
app.set("trust proxy", 1);
// Security Headers
app.use((0, helmet_1.default)());
// CORS configuration
const rawClientUrl = process.env.CLIENT_URL || "http://localhost:5173";
const allowedOrigins = rawClientUrl
    .split(",")
    .map((url) => url.trim().replace(/\/$/, ""))
    .filter(Boolean);
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, server-to-server)
        if (!origin)
            return callback(null, true);
        const cleanOrigin = origin.replace(/\/$/, "");
        const isAllowed = allowedOrigins.includes("*") ||
            allowedOrigins.includes(cleanOrigin) ||
            cleanOrigin.endsWith(".vercel.app");
        if (isAllowed) {
            return callback(null, true);
        }
        return callback(null, true);
    },
    credentials: true,
}));
// Body Parsing & Cookie Parser
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
// Routes
app.use("/api/leads", leadRoutes_1.default);
app.use("/api/auth", authRoutes_1.default);
// Health check endpoint
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});
// Centralized Error Handler
app.use(errorHandler_1.errorHandler);
exports.default = app;
