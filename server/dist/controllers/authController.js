"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.logout = exports.login = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const AdminUser_1 = require("../models/AdminUser");
const jwt_1 = require("../utils/jwt");
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const normalizedEmail = email.trim().toLowerCase();
        const user = await AdminUser_1.AdminUser.findOne({ email: normalizedEmail }).select("+passwordHash");
        if (!user) {
            res.status(401).json({ error: { message: "Invalid credentials" } });
            return;
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isMatch) {
            res.status(401).json({ error: { message: "Invalid credentials" } });
            return;
        }
        const token = (0, jwt_1.generateToken)({
            userId: user._id.toString(),
            email: user.email,
        });
        res.cookie("token", token, (0, jwt_1.getCookieOptions)());
        res.status(200).json({ token, email: user.email });
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
const logout = async (req, res, next) => {
    try {
        res.clearCookie("token", (0, jwt_1.getCookieOptions)());
        res.status(200).json({ message: "Logged out successfully" });
    }
    catch (error) {
        next(error);
    }
};
exports.logout = logout;
const getMe = async (req, res, next) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: { message: "Unauthorized" } });
            return;
        }
        res.status(200).json({ email: req.user.email });
    }
    catch (error) {
        next(error);
    }
};
exports.getMe = getMe;
