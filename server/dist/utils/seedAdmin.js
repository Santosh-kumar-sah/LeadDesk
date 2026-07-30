"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
dotenv_1.default.config({ path: path_1.default.join(__dirname, "../../.env") });
const AdminUser_1 = require("../models/AdminUser");
const seedAdmin = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI;
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;
        if (!mongoUri) {
            throw new Error("MONGODB_URI is not set in environment variables");
        }
        if (!adminEmail || !adminPassword) {
            throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env");
        }
        await mongoose_1.default.connect(mongoUri);
        console.log("Connected to MongoDB for seeding...");
        const normalizedEmail = adminEmail.trim().toLowerCase();
        const existingAdmin = await AdminUser_1.AdminUser.findOne({ email: normalizedEmail });
        const passwordHash = await bcryptjs_1.default.hash(adminPassword, 10);
        if (existingAdmin) {
            existingAdmin.passwordHash = passwordHash;
            await existingAdmin.save();
            console.log(`Admin user updated successfully: ${normalizedEmail}`);
        }
        else {
            await AdminUser_1.AdminUser.create({
                email: normalizedEmail,
                passwordHash,
            });
            console.log(`Admin user created successfully: ${normalizedEmail}`);
        }
        await mongoose_1.default.disconnect();
        console.log("Disconnected from MongoDB.");
        process.exit(0);
    }
    catch (error) {
        console.error("Error seeding admin user:", error);
        process.exit(1);
    }
};
seedAdmin();
