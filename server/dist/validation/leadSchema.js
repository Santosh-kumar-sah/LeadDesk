"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStatusSchema = exports.createLeadSchema = exports.leadStatusEnum = exports.budgetRangeEnum = void 0;
const zod_1 = require("zod");
exports.budgetRangeEnum = zod_1.z.enum(["<1k", "1k-5k", "5k-20k", "20k+"]);
exports.leadStatusEnum = zod_1.z.enum(["New", "Contacted", "Closed"]);
exports.createLeadSchema = zod_1.z.object({
    name: zod_1.z
        .string({ required_error: "Name is required" })
        .trim()
        .min(2, "Name must be at least 2 characters")
        .max(80, "Name cannot exceed 80 characters"),
    email: zod_1.z
        .string({ required_error: "Email is required" })
        .trim()
        .toLowerCase()
        .email("Invalid email address"),
    budgetRange: exports.budgetRangeEnum,
    message: zod_1.z
        .string({ required_error: "Message is required" })
        .trim()
        .min(10, "Message must be at least 10 characters")
        .max(1000, "Message cannot exceed 1000 characters"),
    companyWebsite: zod_1.z.string().optional(), // Honeypot field
});
exports.updateStatusSchema = zod_1.z.object({
    status: exports.leadStatusEnum,
});
