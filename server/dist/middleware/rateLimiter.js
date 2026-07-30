"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRateLimiter = exports.leadRateLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
exports.leadRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 30, // Limit each IP to 30 lead submissions per window
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: {
            message: "Too many lead submissions from this IP, please try again after 10 minutes.",
        },
    },
});
exports.authRateLimiter = (0, express_rate_limit_1.default)({
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
